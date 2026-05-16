import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        room: true,
        createdBy: true,
        department: true,
        approver: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: { include: { location: true } },
        createdBy: true,
        department: true,
        approver: true,
      },
    });
  }
}
