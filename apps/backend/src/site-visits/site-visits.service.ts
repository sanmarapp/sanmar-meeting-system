import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateSiteVisitDto } from './dto/create-site-visit.dto';

function mapVisitStatus(s: string): string {
  switch (s) {
    case 'CLIENT_NO_SHOW': return 'NO_SHOW';
    case 'CONFIRMED':      return 'SCHEDULED';
    default:               return s; // SCHEDULED, CANCELLED, COMPLETED pass through
  }
}

function mapSiteReadyStatus(s: string): string {
  switch (s) {
    case 'READY':              return 'READY';
    case 'PREPARING':          return 'PARTIAL';
    case 'VISIT_IN_PROGRESS':  return 'PARTIAL';
    case 'COMPLETED':          return 'READY';
    default:                   return 'NOT_READY';
  }
}

function transformVisit(v: any) {
  if (!v) return null;
  return {
    ...v,
    status: mapVisitStatus(v.status),
    siteReadyStatus: mapSiteReadyStatus(v.siteReadyStatus),
    notes: v.specialRequirements,
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
  ) {}

  async findAll(query: { status?: string; search?: string; date?: string; limit?: number }) {
    const where: any = {};

    if (query.status) {
      const reverseMap: Record<string, string> = {
        SCHEDULED: 'SCHEDULED', COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED', NO_SHOW: 'CLIENT_NO_SHOW',
      };
      where.status = reverseMap[query.status] ?? query.status;
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
      },
      include: VISIT_INCLUDE,
    });

    // Notify site admin
    if (site.siteAdminId) {
      this.notifications.emitToUser(site.siteAdminId, {
        type: 'pending',
        title: 'New Site Visit Scheduled',
        body: `${client.name} visit scheduled at ${site.name} on ${new Date(dto.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      });
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
