import { Module } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { SiteVisitsController } from './site-visits.controller';
import { ClientsController } from './clients.controller';
import { SitesController } from './sites.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [SiteVisitsController, ClientsController, SitesController],
  providers: [SiteVisitsService],
})
export class SiteVisitsModule {}
