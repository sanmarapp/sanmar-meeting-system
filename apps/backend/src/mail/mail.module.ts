import { Module }        from '@nestjs/common';
import { MailerModule }  from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join }          from 'path';
import { MailService }   from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        transport: {
          host:   cfg.get<string>('SMTP_HOST', 'localhost'),
          port:   cfg.get<number>('SMTP_PORT', 587),
          secure: cfg.get<number>('SMTP_PORT', 587) === 465,
          auth: {
            user: cfg.get<string>('SMTP_USER', ''),
            pass: cfg.get<string>('SMTP_PASS', ''),
          },
          tls: { rejectUnauthorized: false }, // Required for some Zimbra configs
        },
        defaults: {
          from: cfg.get<string>('SMTP_FROM', '"Sanmar Properties" <noreply@sanmar.com.bd>'),
        },
        template: {
          dir:     join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports:   [MailService],
})
export class MailModule {}
