import { Module }            from '@nestjs/common';
import { WhatsAppService }   from './whatsapp.service';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports:   [SystemConfigModule],
  providers: [WhatsAppService],
  exports:   [WhatsAppService],
})
export class WhatsAppModule {}
