import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService, UpdateUserDto } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Must be declared before :id to avoid NestJS route conflict
  @Get('locations')
  findAllLocations() {
    return this.usersService.findAllLocations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
