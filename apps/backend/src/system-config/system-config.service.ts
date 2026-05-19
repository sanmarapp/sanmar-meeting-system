import { Injectable, Logger } from '@nestjs/common';
import { PrismaService }     from '../prisma/prisma.service';
import { ConfigService }     from '@nestjs/config';

// ─── Config key constants ───────────────────────────────────────
export const CONFIG_KEYS = {
  // Email (SMTP)
  SMTP_HOST:    'smtp_host',
  SMTP_PORT:    'smtp_port',
  SMTP_USER:    'smtp_user',
  SMTP_PASS:    'smtp_pass',
  SMTP_FROM:    'smtp_from',
  SMTP_ENABLED: 'smtp_enabled',

  // WhatsApp (Walinko)
  WA_API_KEY:     'wa_api_key',
  WA_API_URL:     'wa_api_url',
  WA_SENDER_ID:   'wa_sender_id',
  WA_ENABLED:     'wa_enabled',

  // Segment toggles (Super Admin)
  SEG_BOOKINGS:       'seg_bookings',       // 'true'|'false'
  SEG_EXTERNAL_BOOKS: 'seg_external_books', // External client meetings
  SEG_SITE_VISITS:    'seg_site_visits',
  SEG_FAIRS:          'seg_fairs',

  // Approval routing (Super Admin)
  APPR_BOARD_REQUIRED:    'appr_board_required',    // 'true'|'false'
  APPR_DURATION_MINS:     'appr_duration_mins',     // meetings above N mins require approval
  APPR_EXTERNAL_REQUIRED: 'appr_external_required', // 'true'|'false'
} as const;

export type ConfigKey = typeof CONFIG_KEYS[keyof typeof CONFIG_KEYS];

@Injectable()
export class SystemConfigService {
  private readonly logger = new Logger(SystemConfigService.name);
  private cache = new Map<string, string>(); // in-memory cache, cleared on update

  constructor(
    private prisma: PrismaService,
    private env:    ConfigService,
  ) {}

  // ── Get single value (DB → env fallback) ─────────────────────
  async get(key: ConfigKey): Promise<string | null> {
    // Check in-memory cache first
    if (this.cache.has(key)) return this.cache.get(key)!;

    try {
      const row = await this.prisma.systemConfig.findUnique({ where: { key } });
      if (row?.value) {
        this.cache.set(key, row.value);
        return row.value;
      }
    } catch {
      // DB not available — fall back to env
    }

    // Fallback: env var (uppercase key, dots replaced with _)
    const envKey = key.toUpperCase().replace(/-/g, '_');
    return this.env.get<string>(envKey) ?? null;
  }

  // ── Get all configs for a group ───────────────────────────────
  async getGroup(group: string) {
    return this.prisma.systemConfig.findMany({
      where: { group },
      orderBy: { key: 'asc' },
    });
  }

  // ── Get all configs (Super Admin view) ───────────────────────
  async getAll() {
    return this.prisma.systemConfig.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  }

  // ── Upsert a value (Super Admin action) ──────────────────────
  async set(key: ConfigKey, value: string, updatedBy: string) {
    this.cache.delete(key); // Invalidate cache
    return this.prisma.systemConfig.upsert({
      where:  { key },
      update: { value, updatedBy },
      create: { key, value, updatedBy, group: this.inferGroup(key), isSecret: this.isSecretKey(key), label: this.inferLabel(key) },
    });
  }

  // ── Bulk upsert (for settings form save) ─────────────────────
  async setBulk(entries: { key: ConfigKey; value: string }[], updatedBy: string) {
    this.cache.clear();
    await Promise.all(entries.map(e => this.set(e.key, e.value, updatedBy)));
    return { updated: entries.length };
  }

  // ── Get SMTP config as object ─────────────────────────────────
  async getSmtpConfig() {
    const [host, port, user, pass, from, enabled] = await Promise.all([
      this.get(CONFIG_KEYS.SMTP_HOST),
      this.get(CONFIG_KEYS.SMTP_PORT),
      this.get(CONFIG_KEYS.SMTP_USER),
      this.get(CONFIG_KEYS.SMTP_PASS),
      this.get(CONFIG_KEYS.SMTP_FROM),
      this.get(CONFIG_KEYS.SMTP_ENABLED),
    ]);
    return {
      host:    host    ?? this.env.get('SMTP_HOST', 'localhost'),
      port:    Number(port ?? this.env.get('SMTP_PORT', '587')),
      user:    user    ?? this.env.get('SMTP_USER', ''),
      pass:    pass    ?? this.env.get('SMTP_PASS', ''),
      from:    from    ?? this.env.get('SMTP_FROM', '"Sanmar Properties" <noreply@mysanmar.com>'),
      enabled: (enabled ?? 'true') === 'true',
    };
  }

  // ── Get WhatsApp config as object ────────────────────────────
  async getWhatsAppConfig() {
    const [apiKey, apiUrl, senderId, enabled] = await Promise.all([
      this.get(CONFIG_KEYS.WA_API_KEY),
      this.get(CONFIG_KEYS.WA_API_URL),
      this.get(CONFIG_KEYS.WA_SENDER_ID),
      this.get(CONFIG_KEYS.WA_ENABLED),
    ]);
    return {
      apiKey:   apiKey   ?? this.env.get('WA_API_KEY', ''),
      apiUrl:   apiUrl   ?? this.env.get('WA_API_URL', 'https://app.walinko.com/api/v1'),
      senderId: senderId ?? this.env.get('WA_SENDER_ID', ''),
      enabled:  (enabled ?? 'false') === 'true',
    };
  }

  // ── Get segment flags as object ──────────────────────────────
  async getSegments() {
    const keys = [
      CONFIG_KEYS.SEG_BOOKINGS,
      CONFIG_KEYS.SEG_EXTERNAL_BOOKS,
      CONFIG_KEYS.SEG_SITE_VISITS,
      CONFIG_KEYS.SEG_FAIRS,
    ];
    const values = await Promise.all(keys.map(k => this.get(k)));
    return {
      bookings:        (values[0] ?? 'true') === 'true',
      externalBookings:(values[1] ?? 'true') === 'true',
      siteVisits:      (values[2] ?? 'true') === 'true',
      fairs:           (values[3] ?? 'true') === 'true',
    };
  }

  // ── Get approval routing config as object ────────────────────
  async getApprovalConfig() {
    const [boardReq, durationMins, externalReq] = await Promise.all([
      this.get(CONFIG_KEYS.APPR_BOARD_REQUIRED),
      this.get(CONFIG_KEYS.APPR_DURATION_MINS),
      this.get(CONFIG_KEYS.APPR_EXTERNAL_REQUIRED),
    ]);
    return {
      boardRoomRequired:    (boardReq    ?? 'true') === 'true',
      durationThresholdMins: Number(durationMins ?? '120'),
      externalMeetingRequired: (externalReq ?? 'false') === 'true',
    };
  }

  // ── Seed defaults (called on app start if table is empty) ────
  async seedDefaults() {
    const count = await this.prisma.systemConfig.count();
    if (count > 0) return; // Already seeded

    const defaults = [
      // Email
      { key: CONFIG_KEYS.SMTP_HOST,    value: this.env.get('SMTP_HOST', ''), group: 'email', label: 'SMTP Host',     isSecret: false },
      { key: CONFIG_KEYS.SMTP_PORT,    value: this.env.get('SMTP_PORT', '587'), group: 'email', label: 'SMTP Port', isSecret: false },
      { key: CONFIG_KEYS.SMTP_USER,    value: this.env.get('SMTP_USER', ''), group: 'email', label: 'SMTP Username', isSecret: false },
      { key: CONFIG_KEYS.SMTP_PASS,    value: this.env.get('SMTP_PASS', ''), group: 'email', label: 'SMTP Password', isSecret: true  },
      { key: CONFIG_KEYS.SMTP_FROM,    value: this.env.get('SMTP_FROM', '"Sanmar Properties" <noreply@mysanmar.com>'), group: 'email', label: 'From Address', isSecret: false },
      { key: CONFIG_KEYS.SMTP_ENABLED, value: 'true', group: 'email', label: 'Email Enabled', isSecret: false },
      // WhatsApp
      { key: CONFIG_KEYS.WA_API_KEY,   value: this.env.get('WA_API_KEY', ''), group: 'whatsapp', label: 'Walinko API Key', isSecret: true  },
      { key: CONFIG_KEYS.WA_API_URL,   value: this.env.get('WA_API_URL', 'https://app.walinko.com/api/v1'), group: 'whatsapp', label: 'Walinko API URL', isSecret: false },
      { key: CONFIG_KEYS.WA_SENDER_ID, value: this.env.get('WA_SENDER_ID', ''), group: 'whatsapp', label: 'WhatsApp Sender ID', isSecret: false },
      { key: CONFIG_KEYS.WA_ENABLED,   value: 'false', group: 'whatsapp', label: 'WhatsApp Enabled', isSecret: false },
    ] as const;

    for (const d of defaults) {
      await this.prisma.systemConfig.upsert({
        where:  { key: d.key },
        update: {},
        create: { key: d.key, value: d.value, group: d.group, label: d.label, isSecret: d.isSecret },
      });
    }
    this.logger.log('SystemConfig defaults seeded');
  }

  // ── Helpers ──────────────────────────────────────────────────
  private inferGroup(key: string): string {
    if (key.startsWith('smtp_')) return 'email';
    if (key.startsWith('wa_'))   return 'whatsapp';
    return 'general';
  }

  private isSecretKey(key: string): boolean {
    return ['smtp_pass', 'wa_api_key'].includes(key);
  }

  private inferLabel(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
