import { api } from './api';

// ─── Types ─────────────────────────────────────────────────────
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type MeetingType   = 'INTERNAL' | 'CLIENT' | 'BOARD' | 'TRAINING' | 'OTHER';

export interface Booking {
  id:            string;
  title:         string;
  description?:  string;
  meetingType:   MeetingType;
  startTime:     string;
  endTime:       string;
  attendeeCount: number;
  status:        BookingStatus;
  approvalStatus?: string;
  room:          { id: string; name: string; location?: { name: string } };
  createdBy:     { id: string; name: string; email: string };
  department?:   { id: string; name: string };
  approver?:     { id: string; name: string };
  createdAt:     string;
}

export interface CreateBookingDto {
  title:          string;
  description?:   string;
  roomId:         string;
  startTime:      string;  // ISO
  endTime:        string;  // ISO
  attendeeCount:  number;
  meetingType:    MeetingType;
  arrangementType?: string;
  requiresRefreshment?: boolean;
  notes?:         string;
}

export interface BookingListParams {
  page?:   number;
  limit?:  number;
  status?: BookingStatus;
  search?: string;
  date?:   string;
  roomId?: string;
}

export interface PaginatedBookings {
  data:  Booking[];
  total: number;
  page:  number;
  limit: number;
}

// ─── Booking service ───────────────────────────────────────────
export const bookingService = {
  async list(params?: BookingListParams): Promise<PaginatedBookings> {
    const { data } = await api.get<PaginatedBookings>('/bookings', { params });
    return data;
  },

  async getById(id: string): Promise<Booking> {
    const { data } = await api.get<Booking>(`/bookings/${id}`);
    return data;
  },

  async create(dto: CreateBookingDto): Promise<Booking> {
    const { data } = await api.post<Booking>('/bookings', dto);
    return data;
  },

  async update(id: string, dto: Partial<CreateBookingDto>): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}`, dto);
    return data;
  },

  async cancel(id: string): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}/cancel`);
    return data;
  },

  async approve(id: string): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}/approve`);
    return data;
  },

  async reject(id: string, reason?: string): Promise<Booking> {
    const { data } = await api.patch<Booking>(`/bookings/${id}/reject`, { reason });
    return data;
  },
};

export default bookingService;
