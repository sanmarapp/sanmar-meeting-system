import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function transformRoom(r: any) {
  if (!r) return null;
  return {
    ...r,
    name:     r.roomName,
    type:     r.roomType?.toUpperCase() ?? r.roomType,
    floor:    r.floor,
    amenities: [],        // schema has no amenities column; return empty array
  };
}

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const rooms = await this.prisma.room.findMany({
      where: { isActive: true },
      include: { location: true },
      orderBy: { roomName: 'asc' },
    });
    return rooms.map(transformRoom);
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { location: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    return transformRoom(room);
  }

  async checkAvailability(roomId: string, date: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const day  = new Date(date);
    const next = new Date(date); next.setDate(next.getDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['pending_approval', 'confirmed', 'in_progress'] as any },
        startTime: { gte: day, lt: next },
      },
      select: { startTime: true, endTime: true },
    });

    // Generate hourly slots 08:00–19:00
    const slots = [];
    for (let h = 8; h < 20; h++) {
      const slotStart = new Date(day); slotStart.setHours(h,    0, 0, 0);
      const slotEnd   = new Date(day); slotEnd.setHours(h + 1, 0, 0, 0);

      const occupied = bookings.some(b =>
        b.startTime < slotEnd && b.endTime > slotStart,
      );

      slots.push({
        start:     slotStart.toISOString(),
        end:       slotEnd.toISOString(),
        available: !occupied,
      });
    }

    return { roomId, date, slots };
  }
}
