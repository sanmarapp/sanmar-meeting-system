import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService, DateRangeParams } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard }   from '../auth/roles.guard';
import { Roles }        from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'CORPORATE_ADMIN')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  // ── JSON endpoints ────────────────────────────────────────────────────────

  @Get('bookings')
  bookingReport(
    @Query('startDate')  startDate?:  string,
    @Query('endDate')    endDate?:    string,
    @Query('locationId') locationId?: string,
  ) {
    return this.svc.bookingReport({ startDate, endDate, locationId });
  }

  @Get('site-visits')
  siteVisitReport(
    @Query('startDate')  startDate?:  string,
    @Query('endDate')    endDate?:    string,
    @Query('locationId') locationId?: string,
  ) {
    return this.svc.siteVisitReport({ startDate, endDate, locationId });
  }

  @Get('fairs')
  fairReport(
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?:   string,
  ) {
    return this.svc.fairReport({ startDate, endDate });
  }

  // ── CSV export endpoints ──────────────────────────────────────────────────

  @Get('bookings/export')
  async exportBookings(
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?:   string,
    @Query('locationId') locationId?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.svc.bookingCsv({ startDate, endDate, locationId });
    const filename = `bookings-report-${new Date().toISOString().slice(0,10)}.csv`;
    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res!.send(csv);
  }

  @Get('site-visits/export')
  async exportSiteVisits(
    @Query('startDate')  startDate?:  string,
    @Query('endDate')    endDate?:    string,
    @Res() res?: Response,
  ) {
    const csv = await this.svc.siteVisitCsv({ startDate, endDate });
    const filename = `site-visits-report-${new Date().toISOString().slice(0,10)}.csv`;
    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res!.send(csv);
  }

  @Get('fairs/export')
  async exportFairs(
    @Query('startDate') startDate?: string,
    @Query('endDate')   endDate?:   string,
    @Res() res?: Response,
  ) {
    const csv = await this.svc.fairCsv({ startDate, endDate });
    const filename = `fairs-report-${new Date().toISOString().slice(0,10)}.csv`;
    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res!.send(csv);
  }
}
