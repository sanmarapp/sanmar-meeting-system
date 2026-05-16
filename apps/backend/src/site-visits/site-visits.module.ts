import { Module } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { SiteVisitsController } from './site-visits.controller';

@Module({
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService],
})
export class SiteVisitsModule {}
