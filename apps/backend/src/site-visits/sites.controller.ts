import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sites')
@UseGuards(JwtAuthGuard)
export class SitesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.prisma.projectSite.findMany({
      where: {
        isActive: true,
        allowVisits: true,
        ...(search ? { name: { contains: search, mode: 'insensitive' as any } } : {}),
      },
      select: { id: true, name: true, address: true, status: true },
      orderBy: { name: 'asc' },
      take: 50,
    });
  }
}
