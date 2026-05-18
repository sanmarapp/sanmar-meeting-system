import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { CreateSiteVisitDto } from './dto/create-site-visit.dto';

function mapVisitStatus(s: string): string {
  // CLIENT_NO_SHOW is legacy — map to canonical NO_SHOW
  if (s === 'CLIENT_NO_SHOW') return 'NO_SHOW';
  // CONFIRMED collapses to SCHEDULED for frontend display
  if (s === 'CONFIRMED') return 'SCHEDULED';
  return s; // SCHEDULED, RESCHEDULED, NO_SHOW, CANCELLED, COMPLETED pass through
}

function mapSiteReadyStatus(s: string): string {
  // New enum values map 1:1
  if (['READY', 'NOT_READY', 'PARTIAL'].includes(s)) return s;
  if (s === 'PREPARING' || s === 'VISIT_IN_PROGRESS') return 'PARTIAL';
  if (s === 'COMPLETED') return 'READY';
  return 'NOT_READY'; // PENDING default
}

function transformVisit(v: any) {
  if (!v) return null;
  return {
    ...v,
    status:          mapVisitStatus(v.status),
    siteReadyStatus: mapSiteReadyStatus(v.siteReadyStatus),
    notes:           v.specialRequirements,
    clientType:      v.clientType      ?? null,
    assistanceContact: v.assistanceContact ?? null,
  };
}

const VISIT_INCLUDE = {
  client:   { select: { id: true, name: true, email: true, phone: true } },
  site:     { select: { id: true, name: true, address: true } },
  bookedBy: { select: { id: true, name: true } },
};

@Injectable()
export class SiteVisitsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsGateway,
    private audit: AuditService,
    private mail: MailService,
  ) {}

  async findAll(query: { status?: string; search?: string; date?: string; limit?: number }) {
    const where: any = {};

    if (query.status) {
      // NO_SHOW matches both the new native value and legacy CLIENT_NO_SHOW
      if (query.status === 'NO_SHOW') {
        where.status = { in: ['NO_SHOW', 'CLIENT_NO_SHOW'] };
      } else {
        where.status = query.status;
      }
    }

    if (query.date) {
      const d = new Date(query.date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.visitDate = { gte: d, lt: next };
    }

    if (query.search) {
      where.OR = [
        { client: { name: { contains: query.search, mode: 'insensitive' } } },
        { site:   { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const visits = await this.prisma.siteVisit.findMany({
      where,
      include: VISIT_INCLUDE,
      orderBy: { visitDate: 'desc' },
      ...(query.limit ? { take: Number(query.limit) } : {}),
    });

    return visits.map(transformVisit);
  }

  async findOne(id: string) {
    const v = await this.prisma.siteVisit.findUnique({ where: { id }, include: VISIT_INCLUDE });
    if (!v) throw new NotFoundException('Site visit not found');
    return transformVisit(v);
  }

  async create(dto: CreateSiteVisitDto, userId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Client not found');

    const site = await this.prisma.projectSite.findUnique({ where: { id: dto.siteId } });
    if (!site) throw new NotFoundException('Project site not found');
    if (!site.allowVisits) throw new BadRequestException('This site does not allow visits currently');

    const visit = await this.prisma.siteVisit.create({
      data: {
        clientId:            dto.clientId,
        siteId:              dto.siteId,
        visitDate:           new Date(dto.visitDate),
        visitTime:           dto.visitTime,
        bookedById:          userId,
        status:              'SCHEDULED' as any,
        siteReadyStatus:     'PENDING' as any,
        specialRequirements: dto.notes,
        clientType:          dto.clientType   as any ?? null,
        assistanceContact:   dto.assistanceContact ?? null,
        partySize:           dto.partySize ?? 1,
      },
      include: VISIT_INCLUDE,
    });

    // Audit: visit created
    await this.audit.log({
      userId,
      action: 'SITE_VISIT_CREATED',
      entity: 'SiteVisit',
      entityId: visit.id,
      changes: { clientId: dto.clientId, siteId: dto.siteId, visitDate: dto.visitDate },
    });

    // Notify site admin via WebSocket
    if (site.siteAdminId) {
      this.notifications.emitToUser(site.siteAdminId, {
        type: 'pending',
        title: 'New Site Visit Scheduled',
        body: `${client.name} visit scheduled at ${site.name} on ${new Date(dto.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      });
    }

    // Email: confirmation to the sales rep who booked
    const booker = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    if (booker?.email) {
      const visitDateFmt = new Date(dto.visitDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      this.mail.sendSiteVisitConfirmation({
        recipientName:  booker.name,
        recipientEmail: booker.email,
        visitId:        visit.id,
        clientName:     client.name,
        siteName:       site.name,
        visitDate:      visitDateFmt,
        visitTime:      dto.visitTime,
        bookedByName:   booker.name,
      });
    }

    // Email: also notify site admin if they have email
    if (site.siteAdminId) {
      const siteAdmin = await this.prisma.user.findUnique({ where: { id: site.siteAdminId }, select: { name: true, email: true, notifyEmail: true } });
      if (siteAdmin?.email && siteAdmin.notifyEmail) {
        const visitDateFmt = new Date(dto.visitDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        this.mail.sendSiteVisitConfirmation({
          recipientName:  siteAdmin.name,
          recipientEmail: siteAdmin.email,
          visitId:        visit.id,
          clientName:     client.name,
          siteName:       site.name,
          visitDate:      visitDateFmt,
          visitTime:      dto.visitTime,
          bookedByName:   booker?.name ?? 'Sales Rep',
        });
      }
    }

    return transformVisit(visit);
  }

  async cancel(id: string, userId: string) {
    const visit = await this.prisma.siteVisit.findUnique({
      where: { id },
      include: { site: true, client: true },
    });
    if (!visit) throw new NotFoundException('Site visit not found');
    if (visit.status === 'CANCELLED') throw new BadRequestException('Visit already cancelled');

    const updated = await this.prisma.siteVisit.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
      include: VISIT_INCLUDE,
    });

    // Audit: visit cancelled
    await this.audit.log({
      userId,
      action: 'SITE_VISIT_CANCELLED',
      entity: 'SiteVisit',
      entityId: id,
      changes: { previousStatus: visit.status },
    });

    // Notify site admin
    if (visit.site?.siteAdminId) {
      this.notifications.emitToUser(visit.site.siteAdminId, {
        type: 'cancelled',
        title: 'Site Visit Cancelled',
        body: `Visit for ${visit.client.name} at ${visit.site.name} has been cancelled.`,
      });
    }

    return transformVisit(updated);
  }
}
