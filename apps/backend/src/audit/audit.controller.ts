import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService, AuditListParams } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard }   from '../auth/roles.guard';
import { Roles }        from '../auth/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(
    @Query('page')      page?:      string,
    @Query('limit')     limit?:     string,
    @Query('userId')    userId?:    string,
    @Query('entity')    entity?:    string,
    @Query('action')    action?:    string,
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?:   string,
  ) {
    const params: AuditListParams = {
      page:      page  ? +page  : undefined,
      limit:     limit ? +limit : undefined,
      userId,
      entity,
      action,
      startDate,
      endDate,
    };
    return this.auditService.list(params);
  }

  @Get('entity-types')
  getEntityTypes() {
    return this.auditService.getEntityTypes();
  }

  @Get('action-types')
  getActionTypes() {
    return this.auditService.getActionTypes();
  }
}
