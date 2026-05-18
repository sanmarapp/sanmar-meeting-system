import { api } from './api';

// ── Enums ─────────────────────────────────────────────────────────────────────

export type FairStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type RegistrationType = 'WALK_IN' | 'PRE_REGISTERED' | 'INVITED';
export type LeadInterestLevel = 'HOT' | 'WARM' | 'COLD';
export type LeadStatus =
  | 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'SITE_VISIT'
  | 'NEGOTIATING' | 'CONVERTED' | 'LOST';

// ── Models ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  userId: string;
  name:   string;
  role:   'MANAGER' | 'SALES' | 'REGISTRATION';
}

export interface Fair {
  id:              string;
  name:            string;
  startDate:       string;
  endDate:         string;
  venue:           string;
  city:            string;
  locationId?:     string;
  location?:       { id: string; name: string; city: string };
  description?:    string;
  targetVisitors?: number;
  status:          FairStatus;
  teamAssignments: TeamMember[];
  createdById:     string;
  createdBy:       { id: string; name: string };
  isActive:        boolean;
  createdAt:       string;
  updatedAt:       string;
  _count?:         { visitors: number; leads: number };
}

export interface FairVisitor {
  id:               string;
  fairId:           string;
  name:             string;
  phone:            string;
  email?:           string;
  registrationType: RegistrationType;
  source?:          string;
  checkedIn:        boolean;
  checkInTime?:     string;
  notes?:           string;
  registeredById?:  string;
  registeredBy?:    { id: string; name: string };
  leads?:           { id: string; interestLevel: LeadInterestLevel; status: LeadStatus }[];
  createdAt:        string;
}

export interface FairLead {
  id:                 string;
  fairId:             string;
  visitorId:          string;
  visitor:            { id: string; name: string; phone: string; email?: string };
  interestedProjects: string[];
  budgetRange?:       string;
  interestLevel:      LeadInterestLevel;
  requiresFollowUp:   boolean;
  followUpDate?:      string;
  followUpNotes?:     string;
  assignedToId?:      string;
  assignedTo?:        { id: string; name: string };
  status:             LeadStatus;
  notes?:             string;
  capturedById:       string;
  capturedBy:         { id: string; name: string };
  createdAt:          string;
  updatedAt:          string;
}

export interface FairSummary {
  fairId:         string;
  fairName:       string;
  targetVisitors?: number;
  totalVisitors:  number;
  checkedIn:      number;
  noShow:         number;
  totalLeads:     number;
  byInterestLevel: { HOT: number; WARM: number; COLD: number };
  byStatus:       Record<string, number>;
  conversionRate: string;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateFairDto {
  name:            string;
  startDate:       string;
  endDate:         string;
  venue:           string;
  city:            string;
  locationId?:     string;
  description?:    string;
  targetVisitors?: number;
  teamAssignments?: TeamMember[];
}

export interface RegisterVisitorDto {
  fairId:           string;
  name:             string;
  phone:            string;
  email?:           string;
  registrationType?: RegistrationType;
  source?:          string;
  notes?:           string;
}

export interface CaptureLeadDto {
  fairId:             string;
  visitorId:          string;
  interestedProjects?: string[];
  budgetRange?:        string;
  interestLevel?:     LeadInterestLevel;
  requiresFollowUp?:  boolean;
  followUpDate?:      string;
  followUpNotes?:     string;
  assignedToId?:      string;
  notes?:             string;
}

export interface UpdateLeadDto {
  interestLevel?:    LeadInterestLevel;
  status?:           LeadStatus;
  requiresFollowUp?: boolean;
  followUpDate?:     string;
  followUpNotes?:    string;
  assignedToId?:     string;
  notes?:            string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const fairService = {
  // Fairs
  async listFairs(status?: FairStatus): Promise<Fair[]> {
    const { data } = await api.get<Fair[]>('/fairs', { params: status ? { status } : {} });
    return data;
  },

  async getFair(id: string): Promise<Fair> {
    const { data } = await api.get<Fair>(`/fairs/${id}`);
    return data;
  },

  async getFairSummary(id: string): Promise<FairSummary> {
    const { data } = await api.get<FairSummary>(`/fairs/${id}/summary`);
    return data;
  },

  async createFair(dto: CreateFairDto): Promise<Fair> {
    const { data } = await api.post<Fair>('/fairs', dto);
    return data;
  },

  async updateFair(id: string, dto: Partial<CreateFairDto> & { status?: FairStatus }): Promise<Fair> {
    const { data } = await api.patch<Fair>(`/fairs/${id}`, dto);
    return data;
  },

  // Visitors
  async listVisitors(fairId: string): Promise<FairVisitor[]> {
    const { data } = await api.get<FairVisitor[]>(`/fairs/${fairId}/visitors`);
    return data;
  },

  async registerVisitor(dto: RegisterVisitorDto): Promise<FairVisitor> {
    const { data } = await api.post<FairVisitor>('/fairs/visitors', dto);
    return data;
  },

  async checkInVisitor(visitorId: string): Promise<FairVisitor> {
    const { data } = await api.patch<FairVisitor>(`/fairs/visitors/${visitorId}/check-in`);
    return data;
  },

  // Leads
  async listLeads(fairId: string, filters?: { status?: LeadStatus; interestLevel?: LeadInterestLevel }): Promise<FairLead[]> {
    const { data } = await api.get<FairLead[]>(`/fairs/${fairId}/leads`, { params: filters });
    return data;
  },

  async captureLead(dto: CaptureLeadDto): Promise<FairLead> {
    const { data } = await api.post<FairLead>('/fairs/leads', dto);
    return data;
  },

  async updateLead(leadId: string, dto: UpdateLeadDto): Promise<FairLead> {
    const { data } = await api.patch<FairLead>(`/fairs/leads/${leadId}`, dto);
    return data;
  },
};

export default fairService;
