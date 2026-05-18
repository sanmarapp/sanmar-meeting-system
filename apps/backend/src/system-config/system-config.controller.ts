import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { SystemConfigService, ConfigKey } from './system-config.service';
import { JwtAuthGuard }  from '../auth/jwt-auth.guard';
import { RolesGuard }    from '../auth/roles.guard';
import { Roles }         from '../auth/roles.decorator';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ConfigEntryDto {
  @IsString() key:   ConfigKey;
  @IsString() value: string;
}

class UpdateConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigEntryDto)
  entries: ConfigEntryDto[];
}

@Controller('system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class SystemConfigController {
  constructor(private svc: SystemConfigService) {}

  @Get()
  getAll() {
    return this.svc.getAll();
  }

  @Get('smtp')
  getSmtp() {
    return this.svc.getSmtpConfig();
  }

  @Get('whatsapp')
  getWhatsApp() {
    return this.svc.getWhatsAppConfig();
  }

  @Put()
  update(@Body() dto: UpdateConfigDto, @Request() req: any) {
    return this.svc.setBulk(dto.entries, req.user.id);
  }
}
