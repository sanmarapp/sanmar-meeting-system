import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateUserDto {
  name?:           string;
  notifyEmail?:    boolean;
  notifyWhatsapp?: boolean;
  locationIds?:    string[];
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      include: { department: true, locations: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { department: true, locations: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { locationIds, ...rest } = dto;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(locationIds !== undefined && {
          locations: {
            set: locationIds.map((lid) => ({ id: lid })),
          },
        }),
      },
      include: { department: true, locations: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      include: { department: true, locations: true },
    });
  }

  async findAllLocations() {
    return this.prisma.location.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
