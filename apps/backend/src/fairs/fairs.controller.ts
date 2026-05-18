import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import {
  FairsService,
  CreateFairDto, UpdateFairDto,
  RegisterVisitorDto, CaptureLeadDto, UpdateLeadDto,
} from './fairs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FairStatus, LeadInterestLevel, LeadStatus } from '@prisma/client';

@Controller('fairs')
@UseGuards(JwtAuthGuard)
export class FairsController {
  constructor(private readonly svc: FairsService) {}

  // ── Fairs ─────────────────────────────────────────────────────────────────

  @Post()
  createFair(@Body() dto: CreateFairDto, @Request() req: any) {
    return this.svc.createFair(dto, req.user.id);
  }

  @Get()
  listFairs(@Query('status') status?: FairStatus) {
    return this.svc.listFairs(status);
  }

  @Get(':id')
  getFair(@Param('id') id: string) {
    return this.svc.getFair(id);
  }

  @Get(':id/summary')
  getFairSummary(@Param('id') id: string) {
    return this.svc.getFairSummary(id);
  }

  @Patch(':id')
  updateFair(@Param('id') id: string, @Body() dto: UpdateFairDto) {
    return this.svc.updateFair(id, dto);
  }

  @Delete(':id')
  deleteFair(@Param('id') id: string) {
    return this.svc.deleteFair(id);
  }

  // ── Visitors ──────────────────────────────────────────────────────────────

  @Get(':id/visitors')
  listVisitors(@Param('id') id: string) {
    return this.svc.listVisitors(id);
  }

  @Post('visitors')
  registerVisitor(@Body() dto: RegisterVisitorDto) {
    return this.svc.registerVisitor(dto);
  }

  @Patch('visitors/:visitorId/check-in')
  checkInVisitor(@Param('visitorId') visitorId: string) {
    return this.svc.checkInVisitor(visitorId);
  }

  // ── Leads ─────────────────────────────────────────────────────────────────

  @Get(':id/leads')
  listLeads(
    @Param('id') fairId: string,
    @Query('status') status?: LeadStatus,
    @Query('interestLevel') interestLevel?: LeadInterestLevel,
  ) {
    return this.svc.listLeads(fairId, status, interestLevel);
  }

  @Post('leads')
  captureLead(@Body() dto: CaptureLeadDto, @Request() req: any) {
    return this.svc.captureLead({ ...dto, capturedById: req.user.id });
  }

  @Patch('leads/:leadId')
  updateLead(@Param('leadId') leadId: string, @Body() dto: UpdateLeadDto) {
    return this.svc.updateLead(leadId, dto);
  }
}
