import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { CreateSiteVisitDto } from './dto/create-site-visit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('site-visits')
@UseGuards(JwtAuthGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.siteVisitsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteVisitsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSiteVisitDto, @Request() req) {
    return this.siteVisitsService.create(dto, req.user.userId);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @Request() req) {
    return this.siteVisitsService.cancel(id, req.user.userId);
  }
}
