import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule }         from './mail/mail.module';
import { AuditModule }        from './audit/audit.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { WhatsAppModule }     from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    RoomsModule,
    SiteVisitsModule,
    NotificationsModule,
    MailModule,
    AuditModule,
    SystemConfigModule,
    WhatsAppModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {}
