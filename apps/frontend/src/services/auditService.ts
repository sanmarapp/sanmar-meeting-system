import { api } from './api';

export interface AuditLog {
  id:        string;
  userId:    string;
  action:    string;
  entity:    string;
  entityId:  string;
  changes:   Record<string, any>;
  ipAddress: string | null;
  timestamp: string;
}

export interface AuditListParams {
  page?:      number;
  limit?:     number;
  userId?:    string;
  entity?:    string;
  action?:    string;
  startDate?: string;
  endDate?:   string;
}

export interface PaginatedAuditLogs {
  data:  AuditLog[];
  total: number;
  page:  number;
  limit: number;
}

export interface SegmentFlags {
  bookings:         boolean;
  externalBookings: boolean;
  siteVisits:       boolean;
  fairs:            boolean;
}

export interface ApprovalConfig {
  boardRoomRequired:       boolean;
  durationThresholdMins:   number;
  externalMeetingRequired: boolean;
}

export const auditService = {
  async list(params?: AuditListParams): Promise<PaginatedAuditLogs> {
    const { data } = await api.get<PaginatedAuditLogs>('/audit-logs', { params });
    return data;
  },

  async getEntityTypes(): Promise<string[]> {
    const { data } = await api.get<string[]>('/audit-logs/entity-types');
    return data;
  },

  async getActionTypes(): Promise<string[]> {
    const { data } = await api.get<string[]>('/audit-logs/action-types');
    return data;
  },
};

export const systemConfigService = {
  async getSegments(): Promise<SegmentFlags> {
    const { data } = await api.get<SegmentFlags>('/system-config/segments');
    return data;
  },

  async getApprovalConfig(): Promise<ApprovalConfig> {
    const { data } = await api.get<ApprovalConfig>('/system-config/approval-config');
    return data;
  },

  async saveEntries(entries: { key: string; value: string }[]): Promise<void> {
    await api.put('/system-config', { entries });
  },
};

export default auditService;
