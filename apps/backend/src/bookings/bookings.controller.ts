import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Only ADMIN and CORPORATE_ADMIN may approve or reject bookings.
// DEPT_MANAGER has notification-only access — no approval authority.
const APPROVER_ROLES = ['ADMIN', 'CORPORATE_ADMIN'];

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(dto, req.user.userId);
  }

  @Patch(':id/approve')
  @Roles(...APPROVER_ROLES)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @Request() req) {
    return this.bookingsService.approve(id, req.user.userId);
  }

  @Patch(':id/reject')
  @Roles(...APPROVER_ROLES)
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req) {
    return this.bookingsService.reject(id, req.user.userId, body?.reason);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancel(id, req.user.userId);
  }
}
