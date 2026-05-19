import { api } from './api';

export interface DateRange {
  startDate?: string;
  endDate?:   string;
  locationId?: string;
}

// ── Booking Report ─────────────────────────────────────────────────────────

export interface BookingReport {
  period: { from: string; to: string };
  summary: {
    total: number; confirmed: number; pending: number;
    cancelled: number; totalHours: number;
  };
  byMeetingType: { internal: number; external: number };
  byRoom: {
    roomId: string; roomName: string; location: string;
    floor: string; capacity: number; bookings: number;
    hours: number; cancelled: number;
  }[];
  byDepartment: { name: string; bookings: number; hours: number }[];
  dailyTrend: { date: string; count: number }[];
}

// ── Site Visit Report ──────────────────────────────────────────────────────

export interface SiteVisitReport {
  period: { from: string; to: string };
  summary: {
    total: number; completed: number; cancelled: number;
    noShow: number; scheduled: number; conversionRate: string;
  };
  byClientType: { newClients: number; existingClients: number; referrals: number };
  bySalesRep: {
    name: string; role: string; total: number;
    completed: number; noShow: number; conversionRate: string;
  }[];
  bySite: { name: string; location: string; total: number; completed: number }[];
  bySource: { source: string; count: number }[];
  weeklyTrend: { week: string; count: number }[];
}

// ── Fair Report ────────────────────────────────────────────────────────────

export interface FairReport {
  period: { from: string; to: string };
  summary: {
    totalFairs: number; totalVisitors: number; totalLeads: number;
    totalConverted: number; overallConvRate: string;
  };
  byInterestLevel: { hot: number; warm: number; cold: number };
  byLeadStatus: Record<string, number>;
  fairs: {
    id: string; name: string; city: string; venue: string; status: string;
    startDate: string; endDate: string; visitors: number; checkedIn: number;
    leads: number; hot: number; warm: number; cold: number;
    converted: number; conversionRate: string; targetVisitors?: number;
  }[];
}

// ── Service ────────────────────────────────────────────────────────────────

export const reportService = {
  async getBookingReport(params?: DateRange): Promise<BookingReport> {
    const { data } = await api.get<BookingReport>('/reports/bookings', { params });
    return data;
  },

  async getSiteVisitReport(params?: DateRange): Promise<SiteVisitReport> {
    const { data } = await api.get<SiteVisitReport>('/reports/site-visits', { params });
    return data;
  },

  async getFairReport(params?: DateRange): Promise<FairReport> {
    const { data } = await api.get<FairReport>('/reports/fairs', { params });
    return data;
  },

  exportUrl(type: 'bookings' | 'site-visits' | 'fairs', params?: DateRange): string {
    const base = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
    const qs = new URLSearchParams();
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate)   qs.set('endDate',   params.endDate);
    if (params?.locationId) qs.set('locationId', params.locationId);
    const token = localStorage.getItem('token') ?? '';
    qs.set('token', token);
    return `${base}/reports/${type}/export?${qs.toString()}`;
  },
};

export default reportService;
