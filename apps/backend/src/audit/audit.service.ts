import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditParams {
  userId?: string;
  action: string;   // e.g. BOOKING_CREATED, BOOKING_APPROVED
  entity: string;   // e.g. Booking, SiteVisit
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
}

export interface AuditListParams {
  page?:      number;
  limit?:     number;
  userId?:    string;
  entity?:    string;
  action?:    string;
  startDate?: string;
  endDate?:   string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Write an audit entry. Never throws — audit failure must not break
   * the primary operation.
   */
  async log(params: AuditParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId:    params.userId   ?? 'system',
          action:    params.action,
          entity:    params.entity,
          entityId:  params.entityId,
          changes:   params.changes  ?? {},
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (err) {
      this.logger.error(`AuditLog write failed [${params.action}/${params.entityId}]: ${err}`);
    }
  }

  /**
   * Paginated list of audit logs with optional filters.
   */
  async list(params: AuditListParams) {
    const page  = Math.max(1, params.page  ?? 1);
    const limit = Math.min(100, params.limit ?? 50);
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (params.userId)    where.userId = params.userId;
    if (params.entity)    where.entity = { contains: params.entity, mode: 'insensitive' };
    if (params.action)    where.action = { contains: params.action, mode: 'insensitive' };
    if (params.startDate || params.endDate) {
      where.timestamp = {};
      if (params.startDate) where.timestamp.gte = new Date(params.startDate);
      if (params.endDate)   where.timestamp.lte = new Date(params.endDate + 'T23:59:59.999Z');
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Distinct entity types for filter dropdown.
   */
  async getEntityTypes(): Promise<string[]> {
    const rows = await this.prisma.auditLog.findMany({
      distinct: ['entity'],
      select:   { entity: true },
      orderBy:  { entity: 'asc' },
    });
    return rows.map(r => r.entity);
  }

  /**
   * Distinct action types for filter dropdown.
   */
  async getActionTypes(): Promise<string[]> {
    const rows = await this.prisma.auditLog.findMany({
      distinct: ['action'],
      select:   { action: true },
      orderBy:  { action: 'asc' },
    });
    return rows.map(r => r.action);
  }
}
