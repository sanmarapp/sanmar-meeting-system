import { Module } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { SiteVisitsController } from './site-visits.controller';
import { ClientsController } from './clients.controller';
import { SitesController } from './sites.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { MailModule }     from '../mail/mail.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [NotificationsModule, AuditModule, MailModule, WhatsAppModule],
  controllers: [SiteVisitsController, ClientsController, SitesController],
  providers: [SiteVisitsService],
})
export class SiteVisitsModule {}
