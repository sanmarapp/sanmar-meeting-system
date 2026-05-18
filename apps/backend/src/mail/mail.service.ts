import { Injectable, Logger } from '@nestjs/common';
import { MailerService }      from '@nestjs-modules/mailer';

// ─── Payload types ─────────────────────────────────────────────
export interface BookingConfirmationPayload {
  recipientName:  string;
  recipientEmail: string;
  bookingId:      string;
  roomName:       string;
  date:           string;
  startTime:      string;
  endTime:        string;
  title:          string;
  status:         string;
}

export interface BookingApprovalPayload {
  recipientName:  string;
  recipientEmail: string;
  bookingId:      string;
  roomName:       string;
  date:           string;
  startTime:      string;
  title:          string;
  requesterName:  string;
  approveUrl?:    string;
}

export interface BookingStatusPayload {
  recipientName:  string;
  recipientEmail: string;
  bookingId:      string;
  roomName:       string;
  date:           string;
  startTime:      string;
  title:          string;
  approved:       boolean;
  reason?:        string;
}

export interface SiteVisitConfirmationPayload {
  recipientName:  string;
  recipientEmail: string;
  visitId:        string;
  clientName:     string;
  siteName:       string;
  visitDate:      string;
  visitTime:      string;
  bookedByName:   string;
}

export interface SiteVisitTeamAlertPayload {
  recipientName:     string;
  recipientEmail:    string;
  clientName:        string;
  clientType:        string;  // 'NEW_CLIENT' | 'EXISTING_CLIENT' | 'REFERRAL'
  siteName:          string;
  visitDate:         string;
  visitTime:         string;
  bookedByName:      string;
  partySize?:        number;
  assistanceContact?: string;
}

// ─── Mail service ───────────────────────────────────────────────
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailer: MailerService) {}

  // ── Booking: confirmation to requester ──────────────────────
  async sendBookingConfirmation(p: BookingConfirmationPayload) {
    await this.send(p.recipientEmail, `Booking Confirmed: ${p.title}`, 'booking-confirmation', {
      name:      p.recipientName,
      bookingId: p.bookingId.slice(0, 8).toUpperCase(),
      roomName:  p.roomName,
      date:      p.date,
      startTime: p.startTime,
      endTime:   p.endTime,
      title:     p.title,
      status:    p.status,
    });
  }

  // ── Booking: approval request to admin ──────────────────────
  async sendBookingApprovalRequest(p: BookingApprovalPayload) {
    await this.send(p.recipientEmail, `Action Required: Approve booking "${p.title}"`, 'booking-approval-request', {
      name:          p.recipientName,
      bookingId:     p.bookingId.slice(0, 8).toUpperCase(),
      roomName:      p.roomName,
      date:          p.date,
      startTime:     p.startTime,
      title:         p.title,
      requesterName: p.requesterName,
    });
  }

  // ── Booking: approved / rejected result to requester ────────
  async sendBookingStatusUpdate(p: BookingStatusPayload) {
    const subject = p.approved
      ? `✅ Booking Approved: ${p.title}`
      : `❌ Booking Rejected: ${p.title}`;
    await this.send(p.recipientEmail, subject, 'booking-status', {
      name:      p.recipientName,
      bookingId: p.bookingId.slice(0, 8).toUpperCase(),
      roomName:  p.roomName,
      date:      p.date,
      startTime: p.startTime,
      title:     p.title,
      approved:  p.approved,
      reason:    p.reason,
    });
  }

  // ── Site visit: confirmation to sales rep ────────────────────
  async sendSiteVisitConfirmation(p: SiteVisitConfirmationPayload) {
    await this.send(p.recipientEmail, `Site Visit Scheduled: ${p.clientName} at ${p.siteName}`, 'site-visit-confirmation', {
      name:        p.recipientName,
      visitId:     p.visitId.slice(0, 8).toUpperCase(),
      clientName:  p.clientName,
      siteName:    p.siteName,
      visitDate:   p.visitDate,
      visitTime:   p.visitTime,
      bookedBy:    p.bookedByName,
    });
  }

  // ── Site visit: team routing alert ──────────────────────────
  async sendSiteVisitTeamAlert(p: SiteVisitTeamAlertPayload) {
    await this.send(
      p.recipientEmail,
      `Site Visit Assigned: ${p.clientName} at ${p.siteName}`,
      'site-visit-team-alert',
      {
        recipientName:    p.recipientName,
        clientName:       p.clientName,
        siteName:         p.siteName,
        visitDate:        p.visitDate,
        visitTime:        p.visitTime,
        bookedByName:     p.bookedByName,
        partySize:        p.partySize,
        assistanceContact: p.assistanceContact,
        isNew:      p.clientType === 'NEW_CLIENT',
        isReferral: p.clientType === 'REFERRAL',
        isExisting: p.clientType === 'EXISTING_CLIENT',
      },
    );
  }

  // ── Internal helper — fire-and-forget, never throws ─────────
  private async send(to: string, subject: string, template: string, context: Record<string, any>) {
    try {
      await this.mailer.sendMail({ to, subject, template, context });
      this.logger.log(`Email sent → ${to} [${template}]`);
    } catch (err) {
      // Never throw — email failure must not break request flow
      this.logger.error(`Email failed → ${to} [${template}]: ${err?.message ?? err}`);
    }
  }
}
