import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.roomsService.findAll();
  }

  @Get(':id/availability')
  checkAvailability(@Param('id') id: string, @Query('date') date: string) {
    const d = date ?? new Date().toISOString().split('T')[0];
    return this.roomsService.checkAvailability(id, d);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }
}
