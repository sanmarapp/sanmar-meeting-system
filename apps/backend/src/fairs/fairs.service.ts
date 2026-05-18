import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FairStatus, RegistrationType, LeadInterestLevel, LeadStatus } from '@prisma/client';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateFairDto {
  name:           string;
  startDate:      string; // ISO
  endDate:        string; // ISO
  venue:          string;
  city:           string;
  locationId?:    string;
  description?:   string;
  targetVisitors?: number;
  teamAssignments?: { userId: string; name: string; role: 'MANAGER' | 'SALES' | 'REGISTRATION' }[];
}

export interface UpdateFairDto {
  name?:           string;
  startDate?:      string;
  endDate?:        string;
  venue?:          string;
  city?:           string;
  locationId?:     string;
  description?:    string;
  targetVisitors?:  number;
  teamAssignments?: { userId: string; name: string; role: 'MANAGER' | 'SALES' | 'REGISTRATION' }[];
  status?:         FairStatus;
}

export interface RegisterVisitorDto {
  fairId:           string;
  name:             string;
  phone:            string;
  email?:           string;
  registrationType?: RegistrationType;
  source?:          string;
  notes?:           string;
  registeredById?:  string;
}

export interface CheckInVisitorDto {
  visitorId: string;
}

export interface CaptureLeadDto {
  fairId:             string;
  visitorId:          string;
  interestedProjects?: string[];
  budgetRange?:        string;
  interestLevel?:     LeadInterestLevel;
  requiresFollowUp?:  boolean;
  followUpDate?:      string;
  followUpNotes?:     string;
  assignedToId?:      string;
  notes?:             string;
  capturedById:       string;
}

export interface UpdateLeadDto {
  interestLevel?:    LeadInterestLevel;
  status?:           LeadStatus;
  requiresFollowUp?: boolean;
  followUpDate?:     string;
  followUpNotes?:    string;
  assignedToId?:     string;
  notes?:            string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class FairsService {
  constructor(private prisma: PrismaService) {}

  // ── Fairs CRUD ─────────────────────────────────────────────────────────────

  async createFair(dto: CreateFairDto, createdById: string) {
    return this.prisma.fair.create({
      data: {
        name:           dto.name,
        startDate:      new Date(dto.startDate),
        endDate:        new Date(dto.endDate),
        venue:          dto.venue,
        city:           dto.city,
        locationId:     dto.locationId ?? null,
        description:    dto.description ?? null,
        targetVisitors: dto.targetVisitors ?? null,
        teamAssignments: dto.teamAssignments ?? [],
        createdById,
      },
      include: { location: true, createdBy: { select: { id: true, name: true } } },
    });
  }

  async listFairs(status?: FairStatus) {
    return this.prisma.fair.findMany({
      where: {
        isActive: true,
        ...(status ? { status } : {}),
      },
      include: {
        location: true,
        createdBy: { select: { id: true, name: true } },
        _count: { select: { visitors: true, leads: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getFair(id: string) {
    const fair = await this.prisma.fair.findUnique({
      where: { id },
      include: {
        location: true,
        createdBy:  { select: { id: true, name: true } },
        visitors: {
          include: {
            leads: {
              include: {
                assignedTo: { select: { id: true, name: true } },
                capturedBy: { select: { id: true, name: true } },
              },
            },
            registeredBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { visitors: true, leads: true } },
      },
    });
    if (!fair) throw new NotFoundException('Fair not found');
    return fair;
  }

  async updateFair(id: string, dto: UpdateFairDto) {
    const fair = await this.prisma.fair.findUnique({ where: { id } });
    if (!fair) throw new NotFoundException('Fair not found');

    const { startDate, endDate, teamAssignments, ...rest } = dto;

    return this.prisma.fair.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate   ? { endDate:   new Date(endDate)   } : {}),
        ...(teamAssignments !== undefined ? { teamAssignments } : {}),
      },
      include: { location: true, createdBy: { select: { id: true, name: true } } },
    });
  }

  async deleteFair(id: string) {
    const fair = await this.prisma.fair.findUnique({ where: { id } });
    if (!fair) throw new NotFoundException('Fair not found');
    return this.prisma.fair.update({
      where: { id },
      data:  { isActive: false },
    });
  }

  // ── Summary / stats ────────────────────────────────────────────────────────

  async getFairSummary(id: string) {
    const fair = await this.prisma.fair.findUnique({ where: { id } });
    if (!fair) throw new NotFoundException('Fair not found');

    const [totalVisitors, checkedIn, leads] = await Promise.all([
      this.prisma.fairVisitor.count({ where: { fairId: id } }),
      this.prisma.fairVisitor.count({ where: { fairId: id, checkedIn: true } }),
      this.prisma.fairLead.findMany({
        where: { fairId: id },
        select: { interestLevel: true, status: true },
      }),
    ]);

    const byInterestLevel = {
      HOT:  leads.filter(l => l.interestLevel === 'HOT').length,
      WARM: leads.filter(l => l.interestLevel === 'WARM').length,
      COLD: leads.filter(l => l.interestLevel === 'COLD').length,
    };

    const byStatus = leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {});

    return {
      fairId:         id,
      fairName:       fair.name,
      targetVisitors: fair.targetVisitors,
      totalVisitors,
      checkedIn,
      noShow:         totalVisitors - checkedIn,
      totalLeads:     leads.length,
      byInterestLevel,
      byStatus,
      conversionRate: totalVisitors > 0
        ? ((leads.length / totalVisitors) * 100).toFixed(1) + '%'
        : '0%',
    };
  }

  // ── Visitors ───────────────────────────────────────────────────────────────

  async registerVisitor(dto: RegisterVisitorDto) {
    const fair = await this.prisma.fair.findUnique({ where: { id: dto.fairId } });
    if (!fair) throw new NotFoundException('Fair not found');
    if (fair.status === 'CANCELLED') throw new BadRequestException('Fair is cancelled');

    return this.prisma.fairVisitor.create({
      data: {
        fairId:           dto.fairId,
        name:             dto.name,
        phone:            dto.phone,
        email:            dto.email ?? null,
        registrationType: dto.registrationType ?? 'WALK_IN',
        source:           dto.source ?? null,
        notes:            dto.notes ?? null,
        registeredById:   dto.registeredById ?? null,
      },
      include: {
        registeredBy: { select: { id: true, name: true } },
      },
    });
  }

  async checkInVisitor(visitorId: string) {
    const visitor = await this.prisma.fairVisitor.findUnique({ where: { id: visitorId } });
    if (!visitor) throw new NotFoundException('Visitor not found');

    return this.prisma.fairVisitor.update({
      where: { id: visitorId },
      data:  { checkedIn: true, checkInTime: new Date() },
      include: { registeredBy: { select: { id: true, name: true } } },
    });
  }

  async listVisitors(fairId: string) {
    const fair = await this.prisma.fair.findUnique({ where: { id: fairId } });
    if (!fair) throw new NotFoundException('Fair not found');

    return this.prisma.fairVisitor.findMany({
      where: { fairId },
      include: {
        registeredBy: { select: { id: true, name: true } },
        leads: { select: { id: true, interestLevel: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Leads ──────────────────────────────────────────────────────────────────

  async captureLead(dto: CaptureLeadDto) {
    const visitor = await this.prisma.fairVisitor.findUnique({
      where: { id: dto.visitorId },
    });
    if (!visitor) throw new NotFoundException('Visitor not found');
    if (visitor.fairId !== dto.fairId) {
      throw new BadRequestException('Visitor does not belong to this fair');
    }

    return this.prisma.fairLead.create({
      data: {
        fairId:             dto.fairId,
        visitorId:          dto.visitorId,
        interestedProjects: dto.interestedProjects ?? [],
        budgetRange:        dto.budgetRange ?? null,
        interestLevel:      dto.interestLevel ?? 'WARM',
        requiresFollowUp:   dto.requiresFollowUp ?? true,
        followUpDate:       dto.followUpDate ? new Date(dto.followUpDate) : null,
        followUpNotes:      dto.followUpNotes ?? null,
        assignedToId:       dto.assignedToId ?? null,
        notes:              dto.notes ?? null,
        capturedById:       dto.capturedById,
      },
      include: {
        visitor:    { select: { id: true, name: true, phone: true } },
        capturedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }

  async listLeads(fairId: string, status?: LeadStatus, interestLevel?: LeadInterestLevel) {
    return this.prisma.fairLead.findMany({
      where: {
        fairId,
        ...(status        ? { status }        : {}),
        ...(interestLevel ? { interestLevel } : {}),
      },
      include: {
        visitor:    { select: { id: true, name: true, phone: true, email: true } },
        capturedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: [
        { interestLevel: 'asc' }, // HOT first (alphabetically COLD<HOT<WARM, so use custom)
        { createdAt: 'desc' },
      ],
    });
  }

  async updateLead(leadId: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.fairLead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const { followUpDate, ...rest } = dto;

    return this.prisma.fairLead.update({
      where: { id: leadId },
      data:  {
        ...rest,
        ...(followUpDate !== undefined
          ? { followUpDate: followUpDate ? new Date(followUpDate) : null }
          : {}),
      },
      include: {
        visitor:    { select: { id: true, name: true, phone: true } },
        capturedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
  }
}
