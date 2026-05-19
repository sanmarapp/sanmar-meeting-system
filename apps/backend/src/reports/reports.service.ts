import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DateRangeParams {
  startDate?: string;
  endDate?:   string;
  locationId?: string;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ── Helpers ───────────────────────────────────────────────────────────────

  private dateRange(params: DateRangeParams) {
    const gte = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 86400000);
    const lte = params.endDate   ? new Date(params.endDate + 'T23:59:59.999Z') : new Date();
    return { gte, lte };
  }

  // ── Booking Utilisation ───────────────────────────────────────────────────

  async bookingReport(params: DateRangeParams) {
    const range = this.dateRange(params);

    const whereClause: any = { startTime: range };
    if (params.locationId) {
      whereClause.room = { locationId: params.locationId };
    }

    const [bookings, rooms] = await Promise.all([
      this.prisma.booking.findMany({
        where: whereClause,
        include: {
          room:      { include: { location: true } },
          createdBy: { select: { id: true, name: true } },
          department:{ select: { id: true, name: true } },
        },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.room.findMany({
        where: { isActive: true, ...(params.locationId ? { locationId: params.locationId } : {}) },
        include: { location: true },
      }),
    ]);

    // Summary counts
    const total     = bookings.length;
    const confirmed = bookings.filter(b => ['confirmed','in_progress','completed'].includes(b.status)).length;
    const pending   = bookings.filter(b => b.status === 'pending_approval').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalHours = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.durationMinutes / 60, 0);

    // By room
    const byRoom = rooms.map(room => {
      const rb = bookings.filter(b => b.roomId === room.id);
      const hours = rb.filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + b.durationMinutes / 60, 0);
      return {
        roomId:     room.id,
        roomName:   room.roomName,
        location:   room.location.name,
        floor:      room.floor,
        capacity:   room.capacity,
        bookings:   rb.length,
        hours:      Math.round(hours * 10) / 10,
        cancelled:  rb.filter(b => b.status === 'cancelled').length,
      };
    }).sort((a, b) => b.bookings - a.bookings);

    // By department
    const deptMap = new Map<string, { name: string; bookings: number; hours: number }>();
    for (const b of bookings) {
      const key = b.departmentId;
      const name = (b.department as any)?.name ?? 'Unknown';
      const existing = deptMap.get(key) ?? { name, bookings: 0, hours: 0 };
      existing.bookings++;
      if (b.status !== 'cancelled') existing.hours += b.durationMinutes / 60;
      deptMap.set(key, existing);
    }
    const byDepartment = Array.from(deptMap.values())
      .map(d => ({ ...d, hours: Math.round(d.hours * 10) / 10 }))
      .sort((a, b) => b.bookings - a.bookings);

    // By meeting type
    const internal = bookings.filter(b => b.meetingType === 'INTERNAL').length;
    const external = bookings.filter(b => b.meetingType === 'CLIENT').length;

    // Daily trend (last 30 days bucketed by day)
    const dailyMap = new Map<string, number>();
    for (const b of bookings) {
      const day = new Date(b.startTime).toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      period:  { from: range.gte.toISOString(), to: range.lte.toISOString() },
      summary: { total, confirmed, pending, cancelled, totalHours: Math.round(totalHours * 10) / 10 },
      byMeetingType: { internal, external },
      byRoom,
      byDepartment,
      dailyTrend,
    };
  }

  // ── Booking CSV ───────────────────────────────────────────────────────────

  async bookingCsv(params: DateRangeParams): Promise<string> {
    const report = await this.bookingReport(params);
    const header = 'Room,Location,Floor,Total Bookings,Hours Used,Cancelled';
    const rows   = report.byRoom.map(r =>
      `"${r.roomName}","${r.location}","${r.floor}",${r.bookings},${r.hours},${r.cancelled}`
    );
    return [header, ...rows].join('\n');
  }

  // ── Site Visit Report ─────────────────────────────────────────────────────

  async siteVisitReport(params: DateRangeParams) {
    const range = this.dateRange(params);

    const visits = await this.prisma.siteVisit.findMany({
      where: { visitDate: range },
      include: {
        client:    { select: { id: true, name: true, phone: true, source: true } },
        site:      { select: { id: true, name: true, location: true } },
        bookedBy:  { select: { id: true, name: true, role: true } },
      },
      orderBy: { visitDate: 'asc' },
    });

    const total     = visits.length;
    const completed = visits.filter(v => v.status === 'COMPLETED').length;
    const cancelled = visits.filter(v => v.status === 'CANCELLED').length;
    const noShow    = visits.filter(v => ['NO_SHOW','CLIENT_NO_SHOW'].includes(v.status)).length;
    const scheduled = visits.filter(v => v.status === 'SCHEDULED').length;
    const convRate  = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    // By sales rep
    const repMap = new Map<string, { name: string; role: string; total: number; completed: number; noShow: number }>();
    for (const v of visits) {
      const key = v.bookedById;
      const rep = repMap.get(key) ?? { name: (v.bookedBy as any)?.name ?? 'Unknown', role: (v.bookedBy as any)?.role ?? '', total: 0, completed: 0, noShow: 0 };
      rep.total++;
      if (v.status === 'COMPLETED') rep.completed++;
      if (['NO_SHOW','CLIENT_NO_SHOW'].includes(v.status)) rep.noShow++;
      repMap.set(key, rep);
    }
    const bySalesRep = Array.from(repMap.values())
      .map(r => ({ ...r, conversionRate: r.total > 0 ? ((r.completed / r.total) * 100).toFixed(1) + '%' : '0%' }))
      .sort((a, b) => b.total - a.total);

    // By site
    const siteMap = new Map<string, { name: string; location: string; total: number; completed: number }>();
    for (const v of visits) {
      const key = v.siteId;
      const site = siteMap.get(key) ?? { name: (v.site as any)?.name ?? 'Unknown', location: (v.site as any)?.location ?? '', total: 0, completed: 0 };
      site.total++;
      if (v.status === 'COMPLETED') site.completed++;
      siteMap.set(key, site);
    }
    const bySite = Array.from(siteMap.values()).sort((a, b) => b.total - a.total);

    // By source
    const sourceMap = new Map<string, number>();
    for (const v of visits) {
      const s = (v.client as any)?.source ?? 'Unknown';
      sourceMap.set(s, (sourceMap.get(s) ?? 0) + 1);
    }
    const bySource = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })).sort((a,b)=>b.count-a.count);

    // By client type
    const newClients      = visits.filter(v => v.clientType === 'NEW_CLIENT').length;
    const existingClients = visits.filter(v => v.clientType === 'EXISTING_CLIENT').length;
    const referrals       = visits.filter(v => v.clientType === 'REFERRAL').length;

    // Weekly trend
    const weekMap = new Map<string, number>();
    for (const v of visits) {
      const d = new Date(v.visitDate);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
    }
    const weeklyTrend = Array.from(weekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return {
      period:  { from: range.gte.toISOString(), to: range.lte.toISOString() },
      summary: { total, completed, cancelled, noShow, scheduled, conversionRate: convRate + '%' },
      byClientType: { newClients, existingClients, referrals },
      bySalesRep,
      bySite,
      bySource,
      weeklyTrend,
    };
  }

  // ── Site Visit CSV ────────────────────────────────────────────────────────

  async siteVisitCsv(params: DateRangeParams): Promise<string> {
    const report = await this.siteVisitReport(params);
    const header = 'Sales Rep,Role,Total Visits,Completed,No Show,Conversion Rate';
    const rows   = report.bySalesRep.map(r =>
      `"${r.name}","${r.role}",${r.total},${r.completed},${r.noShow},"${r.conversionRate}"`
    );
    return [header, ...rows].join('\n');
  }

  // ── Fair / Leads Report ───────────────────────────────────────────────────

  async fairReport(params: DateRangeParams) {
    const range = this.dateRange(params);

    const fairs = await this.prisma.fair.findMany({
      where: {
        isActive: true,
        startDate: range,
      },
      include: {
        location: { select: { id: true, name: true } },
        _count: { select: { visitors: true, leads: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    // For each fair, get lead breakdown
    const fairDetails = await Promise.all(fairs.map(async f => {
      const [visitors, leads] = await Promise.all([
        this.prisma.fairVisitor.count({ where: { fairId: f.id } }),
        this.prisma.fairLead.findMany({
          where:  { fairId: f.id },
          select: { interestLevel: true, status: true },
        }),
      ]);
      const checkedIn = await this.prisma.fairVisitor.count({ where: { fairId: f.id, checkedIn: true } });

      return {
        id:       f.id,
        name:     f.name,
        city:     f.city,
        venue:    f.venue,
        status:   f.status,
        startDate: f.startDate.toISOString(),
        endDate:   f.endDate.toISOString(),
        visitors,
        checkedIn,
        leads:    leads.length,
        hot:      leads.filter(l => l.interestLevel === 'HOT').length,
        warm:     leads.filter(l => l.interestLevel === 'WARM').length,
        cold:     leads.filter(l => l.interestLevel === 'COLD').length,
        converted:leads.filter(l => l.status === 'CONVERTED').length,
        conversionRate: visitors > 0 ? ((leads.length / visitors) * 100).toFixed(1) + '%' : '0%',
        targetVisitors: f.targetVisitors,
      };
    }));

    // Aggregate
    const totalVisitors  = fairDetails.reduce((s, f) => s + f.visitors, 0);
    const totalLeads     = fairDetails.reduce((s, f) => s + f.leads, 0);
    const totalConverted = fairDetails.reduce((s, f) => s + f.converted, 0);
    const totalHot  = fairDetails.reduce((s, f) => s + f.hot, 0);
    const totalWarm = fairDetails.reduce((s, f) => s + f.warm, 0);
    const totalCold = fairDetails.reduce((s, f) => s + f.cold, 0);

    // All leads across all fairs in period for pipeline status breakdown
    const allLeads = await this.prisma.fairLead.findMany({
      where:  { fair: { startDate: range } },
      select: { status: true },
    });
    const byStatus: Record<string, number> = {};
    for (const l of allLeads) {
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    }

    return {
      period:  { from: range.gte.toISOString(), to: range.lte.toISOString() },
      summary: {
        totalFairs: fairs.length,
        totalVisitors,
        totalLeads,
        totalConverted,
        overallConvRate: totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(1) + '%' : '0%',
      },
      byInterestLevel: { hot: totalHot, warm: totalWarm, cold: totalCold },
      byLeadStatus: byStatus,
      fairs: fairDetails,
    };
  }

  // ── Fair CSV ──────────────────────────────────────────────────────────────

  async fairCsv(params: DateRangeParams): Promise<string> {
    const report = await this.fairReport(params);
    const header = 'Fair Name,City,Visitors,Checked In,Leads,Hot,Warm,Cold,Converted,Conversion Rate';
    const rows   = report.fairs.map(f =>
      `"${f.name}","${f.city}",${f.visitors},${f.checkedIn},${f.leads},${f.hot},${f.warm},${f.cold},${f.converted},"${f.conversionRate}"`
    );
    return [header, ...rows].join('\n');
  }
}
