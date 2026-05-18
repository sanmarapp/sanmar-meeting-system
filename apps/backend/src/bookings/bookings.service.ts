import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AuditService } from '../audit/audit.service';
import { MailService }       from '../mail/mail.service';
import { WhatsAppService }   from '../whatsapp/whatsapp.service';
import { CreateBookingDto }  from './dto/create-booking.dto';

// ─── Status mapping (schema → frontend) ─────────────────────────
function mapStatus(status: string, approvalStatus: string): string {
  if (approvalStatus === 'rejected') return 'REJECTED';
  switch (status) {
    case 'pending_approval': return 'PENDING';
    case 'confirmed':        return 'APPROVED';
    case 'in_progress':      return 'APPROVED';
    case 'completed':        return 'COMPLETED';
    case 'cancelled':        return 'CANCELLED';
    default:                 return 'PENDING';
  }
}

function mapApprovalStatus(s: string): string {
  switch (s) {
    case 'not_required':  return 'not_required';
    case 'pending_hod':   return 'pending';
    case 'pending_admin': return 'pending';
    case 'approved':      return 'approved';
    case 'rejected':      return 'rejected';
    default:              return s;
  }
}

function transformBooking(b: any) {
  if (!b) return null;
  return {
    ...b,
    attendeeCount: b.attendeesCount,
    status: mapStatus(b.status, b.approvalStatus),
    approvalStatus: mapApprovalStatus(b.approvalStatus),
    room: b.room ? { ...b.room, name: b.room.roomName, type: b.room.roomType } : b.room,
  };
}

const BOOKING_INCLUDE = {
  room: { include: { location: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  department: { select: { id: true, name: true } },
  approver:   { select: { id: true, name: true } },
};

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsGateway,
    private audit: AuditService,
    private mail:      MailService,
    private whatsapp:  WhatsAppService,
  ) {}

  async findAll(query: {
    page?: number; limit?: number; status?: string;
    search?: string; date?: string; roomId?: string;
  }) {
    const page  = Number(query.page  ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip  = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      const statusMap: Record<string, any> = {
        PENDING:   { status: 'pending_approval' },
        APPROVED:  { status: { in: ['confirmed', 'in_progress'] } },
        REJECTED:  { approvalStatus: 'rejected' },
        COMPLETED: { status: 'completed' },
        CANCELLED: { status: 'cancelled' },
      };
      Object.assign(where, statusMap[query.status] ?? {});
    }

    if (query.date) {
      const d = new Date(query.date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.startTime = { gte: d, lt: next };
    }

    if (query.roomId) where.roomId = query.roomId;

    if (query.search) {
      where.OR = [
        { title:             { contains: query.search, mode: 'insensitive' } },
        { createdBy: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({ where, include: BOOKING_INCLUDE, orderBy: { startTime: 'desc' }, skip, take: limit }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: items.map(transformBooking), total, page, limit };
  }

  async findOne(id: string) {
    const b = await this.prisma.booking.findUnique({ where: { id }, include: BOOKING_INCLUDE });
    if (!b) throw new NotFoundException('Booking not found');
    return transformBooking(b);
  }

  async create(dto: CreateBookingDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });
    if (!user) throw new BadRequestException('User not found');
    if (!user.departmentId) throw new BadRequestException('User has no department assigned');

    const room = await this.prisma.room.findUnique({ where: { id: dto.roomId } });
    if (!room || !room.isActive) throw new NotFoundException('Room not found or inactive');

    // Check for conflicts
    const conflict = await this.prisma.booking.findFirst({
      where: {
        roomId: dto.roomId,
        status: { in: ['pending_approval', 'confirmed', 'in_progress'] },
        AND: [
          { startTime: { lt: new Date(dto.endTime) } },
          { endTime:   { gt: new Date(dto.startTime) } },
        ],
      },
    });
    if (conflict) throw new BadRequestException('Room is already booked for this time slot');

    const start = new Date(dto.startTime);
    const end   = new Date(dto.endTime);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    // All bookings in Corporate Office System require approval (P0-2)
    const requiresApproval = true;
    const status = 'pending_approval';
    const approvalStatus = 'pending_hod';

    const booking = await this.prisma.booking.create({
      data: {
        title: dto.title,
        roomId: dto.roomId,
        startTime: start,
        endTime: end,
        durationMinutes,
        attendeesCount: dto.attendeeCount,
        meetingType: (dto.meetingType as any) ?? 'internal',
        createdById: userId,
        departmentId: user.departmentId,
        status: status as any,
        approvalStatus: approvalStatus as any,
        requiresApproval,
        notes: dto.notes,
        needsTeaCoffee: dto.requiresRefreshment ?? false,
      },
      include: BOOKING_INCLUDE,
    });

    // Audit: booking created
    await this.audit.log({
      userId,
      action: 'BOOKING_CREATED',
      entity: 'Booking',
      entityId: booking.id,
      changes: { title: dto.title, roomId: dto.roomId, startTime: dto.startTime, endTime: dto.endTime },
    });

    const dateLabel = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    // Notify approvers (ADMIN, CORPORATE_ADMIN) — action required
    this.notifications.emitToRole('ADMIN', {
      type: 'pending',
      title: 'New Booking Awaiting Approval',
      body: `${user.name} booked ${room.roomName} on ${dateLabel}`,
      bookingId: booking.id,
    });
    this.notifications.emitToRole('CORPORATE_ADMIN', {
      type: 'pending',
      title: 'New Booking Awaiting Approval',
      body: `${user.name} booked ${room.roomName} on ${dateLabel}`,
      bookingId: booking.id,
    });
    // Notify DEPT_MANAGER — read-only awareness, no action required (P0-1)
    this.notifications.emitToRole('DEPT_MANAGER', {
      type: 'pending',
      title: 'Room Booking Submitted',
      body: `${user.name} submitted a booking for ${room.roomName} on ${dateLabel}`,
      bookingId: booking.id,
    });

    // Email: confirm receipt to requester
    if (user.email) {
      this.mail.sendBookingConfirmation({
        recipientName:  user.name,
        recipientEmail: user.email,
        bookingId:      booking.id,
        roomName:       room.roomName,
        date:           start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        startTime:      start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        endTime:        end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        title:          booking.title,
        status:         'Pending Approval',
      });
    }

    // Email + WhatsApp: notify admins with approval request
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'CORPORATE_ADMIN', 'SUPER_ADMIN'] as any }, isActive: true },
      select: { id: true, name: true, email: true, whatsappNumber: true, notifyEmail: true, notifyWhatsapp: true },
    });
    const dateLabel      = start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const startTimeLabel = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    for (const admin of admins) {
      if (admin.notifyEmail && admin.email) {
        this.mail.sendBookingApprovalRequest({
          recipientName:  admin.name,
          recipientEmail: admin.email,
          bookingId:      booking.id,
          roomName:       room.roomName,
          date:           dateLabel,
          startTime:      startTimeLabel,
          title:          booking.title,
          requesterName:  user.name,
        });
      }
      if (admin.notifyWhatsapp && admin.whatsappNumber) {
        this.whatsapp.sendBookingConfirmation({
          phone:     admin.whatsappNumber,
          name:      admin.name,
          roomName:  room.roomName,
          date:      dateLabel,
          startTime: startTimeLabel,
          title:     `[Approval Needed] ${booking.title} by ${user.name}`,
        });
      }
    }

    // WhatsApp to requester (if enabled)
    if (user.notifyWhatsapp && user.whatsappNumber) {
      this.whatsapp.sendBookingConfirmation({
        phone:     user.whatsappNumber,
        name:      user.name,
        roomName:  room.roomName,
        date:      dateLabel,
        startTime: startTimeLabel,
        title:     booking.title,
      });
    }

    return transformBooking(booking);
  }

  async approve(id: string, approverId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id }, include: { createdBy: true, room: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'pending_approval' &&
        booking.approvalStatus !== 'pending_hod' &&
        booking.approvalStatus !== 'pending_admin') {
      throw new BadRequestException('Booking is not awaiting approval');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'confirmed' as any,
        approvalStatus: 'approved' as any,
        approverId,
        approvedAt: new Date(),
      },
      include: BOOKING_INCLUDE,
    });

    // Audit: booking approved
    await this.audit.log({
      userId: approverId,
      action: 'BOOKING_APPROVED',
      entity: 'Booking',
      entityId: id,
      changes: { previousStatus: booking.status, newStatus: 'confirmed' },
    });

    this.notifications.emitToUser(booking.createdById, {
      type: 'approved',
      title: 'Booking Approved',
      body: `Your booking for ${booking.room.roomName} has been approved.`,
      bookingId: id,
    });

    // Email: status update to requester
    if (booking.createdBy?.email) {
      const s = booking.startTime as Date;
      this.mail.sendBookingStatusUpdate({
        recipientName:  booking.createdBy.name,
        recipientEmail: booking.createdBy.email,
        bookingId:      id,
        roomName:       booking.room.roomName,
        date:           s.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        startTime:      s.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        title:          booking.title,
        approved:       true,
      });
    }

    return transformBooking(updated);
  }

  async reject(id: string, approverId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id }, include: { createdBy: true, room: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled' as any,
        approvalStatus: 'rejected' as any,
        approverId,
        notes: reason ?? booking.notes,
      },
      include: BOOKING_INCLUDE,
    });

    // Audit: booking rejected
    await this.audit.log({
      userId: approverId,
      action: 'BOOKING_REJECTED',
      entity: 'Booking',
      entityId: id,
      changes: { reason: reason ?? null },
    });

    this.notifications.emitToUser(booking.createdById, {
      type: 'rejected',
      title: 'Booking Rejected',
      body: reason
        ? `Your booking for ${booking.room.roomName} was rejected: ${reason}`
        : `Your booking for ${booking.room.roomName} was rejected.`,
      bookingId: id,
    });

    // Email: status update to requester
    if (booking.createdBy?.email) {
      const s = booking.startTime as Date;
      this.mail.sendBookingStatusUpdate({
        recipientName:  booking.createdBy.name,
        recipientEmail: booking.createdBy.email,
        bookingId:      id,
        roomName:       booking.room.roomName,
        date:           s.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        startTime:      s.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        title:          booking.title,
        approved:       false,
        reason,
      });
    }

    return transformBooking(updated);
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id }, include: { createdBy: true, room: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'cancelled') throw new BadRequestException('Booking already cancelled');

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' as any },
      include: BOOKING_INCLUDE,
    });

    // Audit: booking cancelled
    await this.audit.log({
      userId,
      action: 'BOOKING_CANCELLED',
      entity: 'Booking',
      entityId: id,
      changes: { previousStatus: booking.status },
    });

    this.notifications.emitToUser(booking.createdById, {
      type: 'cancelled',
      title: 'Booking Cancelled',
      body: `Your booking for ${booking.room.roomName} has been cancelled.`,
      bookingId: id,
    });

    return transformBooking(updated);
  }
}
