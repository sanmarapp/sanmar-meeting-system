import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { MailModule }         from '../mail/mail.module';
import { WhatsAppModule }     from '../whatsapp/whatsapp.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [NotificationsModule, AuditModule, MailModule, WhatsAppModule, SystemConfigModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
