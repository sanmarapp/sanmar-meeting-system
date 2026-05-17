import { api } from './api';

// ─── Types ─────────────────────────────────────────────────────
export type VisitStatus    = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type SiteReadyStatus = 'READY' | 'NOT_READY' | 'PARTIAL';

export interface SiteVisit {
  id:             string;
  visitDate:      string;
  visitTime:      string;
  status:         VisitStatus;
  notes?:         string;
  client:         { id: string; name: string; email?: string; phone?: string };
  site:           { id: string; name: string; address?: string };
  bookedBy:       { id: string; name: string };
  siteReadyStatus?: SiteReadyStatus;
  createdAt:      string;
}

export interface CreateSiteVisitDto {
  clientId:   string;
  siteId:     string;
  visitDate:  string;
  visitTime:  string;
  notes?:     string;
}

export interface SiteVisitListParams {
  page?:   number;
  limit?:  number;
  status?: VisitStatus;
  search?: string;
  date?:   string;
}

// ─── Site visit service ────────────────────────────────────────
export const siteVisitService = {
  async list(params?: SiteVisitListParams): Promise<SiteVisit[]> {
    const { data } = await api.get<SiteVisit[]>('/site-visits', { params });
    return data;
  },

  async getById(id: string): Promise<SiteVisit> {
    const { data } = await api.get<SiteVisit>(`/site-visits/${id}`);
    return data;
  },

  async create(dto: CreateSiteVisitDto): Promise<SiteVisit> {
    const { data } = await api.post<SiteVisit>('/site-visits', dto);
    return data;
  },

  async update(id: string, dto: Partial<CreateSiteVisitDto>): Promise<SiteVisit> {
    const { data } = await api.patch<SiteVisit>(`/site-visits/${id}`, dto);
    return data;
  },

  async cancel(id: string): Promise<SiteVisit> {
    const { data } = await api.patch<SiteVisit>(`/site-visits/${id}/cancel`);
    return data;
  },
};

export default siteVisitService;
