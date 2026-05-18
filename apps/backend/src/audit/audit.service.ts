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
          userId:    params.userId   ?? null,
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
}
