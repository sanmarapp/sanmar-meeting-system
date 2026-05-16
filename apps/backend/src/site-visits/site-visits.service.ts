import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteVisitsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.siteVisit.findMany({
      include: { client: true, site: true, bookedBy: true },
      orderBy: { visitDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.siteVisit.findUnique({
      where: { id },
      include: { client: true, site: true, bookedBy: true },
    });
  }
}
