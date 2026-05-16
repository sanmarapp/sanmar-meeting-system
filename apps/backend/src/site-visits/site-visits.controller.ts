import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('site-visits')
@UseGuards(JwtAuthGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Get()
  findAll() {
    return this.siteVisitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteVisitsService.findOne(id);
  }
}
