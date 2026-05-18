import { Injectable, Logger } from '@nestjs/common';
import { SystemConfigService } from '../system-config/system-config.service';
import axios from 'axios';

// ─── Payload types ─────────────────────────────────────────────
export interface WhatsAppMessage {
  to:      string; // Phone number with country code: 8801XXXXXXXXX
  message: string; // Plain text body
}

// ─── WhatsApp service (Walinko BD) ─────────────────────────────
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private sysConfig: SystemConfigService) {}

  // ── Send single message ──────────────────────────────────────
  async send(to: string, message: string): Promise<void> {
    const cfg = await this.sysConfig.getWhatsAppConfig();

    if (!cfg.enabled) {
      this.logger.debug(`WhatsApp disabled — skipping message to ${to}`);
      return;
    }

    if (!cfg.apiKey) {
      this.logger.warn('WhatsApp API key not configured');
      return;
    }

    // Normalize phone: strip leading + or 00, ensure starts with country code
    const phone = this.normalizePhone(to);

    try {
      // Walinko REST API
      await axios.post(
        `${cfg.apiUrl}/messages/send`,
        {
          api_key: cfg.apiKey,
          to:      phone,
          message: message,
          ...(cfg.senderId ? { sender_id: cfg.senderId } : {}),
        },
        {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          timeout: 10000,
        },
      );
      this.logger.log(`WhatsApp sent → ${phone}`);
    } catch (err: any) {
      // Never throw — WhatsApp failure must not break request flow
      this.logger.error(`WhatsApp failed → ${phone}: ${err?.response?.data?.message ?? err?.message ?? err}`);
    }
  }

  // ── Booking confirmation ──────────────────────────────────────
  async sendBookingConfirmation(params: {
    phone: string; name: string; roomName: string;
    date: string; startTime: string; title: string;
  }) {
    const msg =
      `📋 *Booking Submitted*\n\n` +
      `Hi ${params.name},\n\n` +
      `Your booking is pending approval.\n\n` +
      `📌 *${params.title}*\n` +
      `🏢 Room: ${params.roomName}\n` +
      `📅 Date: ${params.date}\n` +
      `⏰ Time: ${params.startTime}\n\n` +
      `You'll be notified once approved.\n\n` +
      `— Sanmar Properties`;
    await this.send(params.phone, msg);
  }

  // ── Booking approved ─────────────────────────────────────────
  async sendBookingApproved(params: {
    phone: string; name: string; roomName: string;
    date: string; startTime: string; title: string;
  }) {
    const msg =
      `✅ *Booking Approved*\n\n` +
      `Hi ${params.name},\n\n` +
      `Your booking has been approved!\n\n` +
      `📌 *${params.title}*\n` +
      `🏢 Room: ${params.roomName}\n` +
      `📅 Date: ${params.date}\n` +
      `⏰ Time: ${params.startTime}\n\n` +
      `— Sanmar Properties`;
    await this.send(params.phone, msg);
  }

  // ── Booking rejected ─────────────────────────────────────────
  async sendBookingRejected(params: {
    phone: string; name: string; roomName: string;
    date: string; title: string; reason?: string;
  }) {
    const msg =
      `❌ *Booking Rejected*\n\n` +
      `Hi ${params.name},\n\n` +
      `Your booking was not approved.\n\n` +
      `📌 *${params.title}*\n` +
      `🏢 Room: ${params.roomName}\n` +
      `📅 Date: ${params.date}\n` +
      (params.reason ? `\n📝 Reason: ${params.reason}\n` : '') +
      `\nPlease submit a new request if needed.\n\n` +
      `— Sanmar Properties`;
    await this.send(params.phone, msg);
  }

  // ── Site visit confirmation ───────────────────────────────────
  async sendSiteVisitConfirmation(params: {
    phone: string; name: string; clientName: string;
    siteName: string; visitDate: string; visitTime: string;
  }) {
    const msg =
      `🏗️ *Site Visit Scheduled*\n\n` +
      `Hi ${params.name},\n\n` +
      `A site visit has been scheduled.\n\n` +
      `👤 Client: ${params.clientName}\n` +
      `📍 Site: ${params.siteName}\n` +
      `📅 Date: ${params.visitDate}\n` +
      `⏰ Time: ${params.visitTime}\n\n` +
      `Please ensure site preparation is completed before the visit.\n\n` +
      `— Sanmar Properties`;
    await this.send(params.phone, msg);
  }

  // ── Site visit team routing alert ────────────────────────────
  async sendSiteVisitTeamAlert(params: {
    phone: string; name: string; clientName: string; clientType: string;
    siteName: string; visitDate: string; visitTime: string;
    bookedByName: string; partySize?: number; assistanceContact?: string;
  }) {
    const typeLabel: Record<string, string> = {
      NEW_CLIENT:      '🆕 New Client',
      EXISTING_CLIENT: '🔄 Existing Client',
      REFERRAL:        '👥 Referral',
    };
    const label = typeLabel[params.clientType] ?? params.clientType;
    const msg =
      `🏗️ *Site Visit Assigned to Your Team*\n\n` +
      `Hi ${params.name},\n\n` +
      `A site visit has been routed to your team.\n\n` +
      `👤 Client: ${params.clientName}\n` +
      `🏷️ Type: ${label}\n` +
      `📍 Site: ${params.siteName}\n` +
      `📅 Date: ${params.visitDate}\n` +
      `⏰ Time: ${params.visitTime}\n` +
      (params.partySize && params.partySize > 1 ? `👨‍👩‍👧 Party Size: ${params.partySize}\n` : '') +
      `\nBooked by: ${params.bookedByName}\n\n` +
      `Please coordinate with the client and prepare accordingly.\n\n` +
      `— Sanmar Properties`;
    await this.send(params.phone, msg);
  }

  // ── Normalize BD phone numbers ────────────────────────────────
  private normalizePhone(phone: string): string {
    let p = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    if (p.startsWith('+')) p = p.slice(1);
    if (p.startsWith('00')) p = p.slice(2);
    // BD numbers: if starts with 01, prepend 880
    if (p.startsWith('01') && p.length === 11) p = '880' + p.slice(1);
    return p;
  }
}
