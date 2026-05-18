import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SystemConfigService } from './system-config/system-config.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private sysConfig: SystemConfigService) {}

  async onApplicationBootstrap() {
    // Seed default system config entries if not present
    await this.sysConfig.seedDefaults();
  }

  getHello(): string {
    return 'Sanmar Meeting System API';
  }
}
