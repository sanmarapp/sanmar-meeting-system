import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, MapPin, CalendarDays, Users, TrendingUp,
  ChevronRight, ArrowLeft, X, UserCheck, Flame, Thermometer,
  Snowflake, CheckCircle2, PhoneCall, Star,
} from 'lucide-react';
import {
  fairService,
  type Fair, type FairVisitor, type FairLead, type FairSummary,
  type FairStatus, type LeadInterestLevel, type LeadStatus,
  type CreateFairDto, type RegisterVisitorDto, type CaptureLeadDto, type UpdateLeadDto,
} from '../services/fairService';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { toast } from 'sonner';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return fmtDate(start);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${s.toLocaleString('en-GB', { month: 'short' })} ${s.getFullYear()}`;
  }
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

// ── Status configs ─────────────────────────────────────────────────────────────

const FAIR_STATUS_LABEL: Record<FairStatus, string> = {
  UPCOMING:  'Upcoming',
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const FAIR_STATUS_STYLE: Record<FairStatus, string> = {
  UPCOMING:  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  ACTIVE:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-stone-500/15 text-stone-400 border-stone-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const INTEREST_ICON: Record<LeadInterestLevel, React.ReactNode> = {
  HOT:  <Flame      size={13} className="text-red-400"    />,
  WARM: <Thermometer size={13} className="text-amber-400" />,
  COLD: <Snowflake  size={13} className="text-blue-400"   />,
};

const INTEREST_STYLE: Record<LeadInterestLevel, string> = {
  HOT:  'bg-red-500/15  text-red-400  border-red-500/20',
  WARM: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  COLD: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW:         'New',
  CONTACTED:   'Contacted',
  QUALIFIED:   'Qualified',
  SITE_VISIT:  'Site Visit',
  NEGOTIATING: 'Negotiating',
  CONVERTED:   'Converted',
  LOST:        'Lost',
};

const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  NEW:         'bg-stone-500/15 text-stone-400',
  CONTACTED:   'bg-blue-500/15 text-blue-400',
  QUALIFIED:   'bg-violet-500/15 text-violet-400',
  SITE_VISIT:  'bg-amber-500/15 text-amber-400',
  NEGOTIATING: 'bg-orange-500/15 text-orange-400',
  CONVERTED:   'bg-emerald-500/15 text-emerald-400',
  LOST:        'bg-red-500/15 text-red-400',
};

const BUDGET_OPTIONS = [
  'Under 50 Lakh', '50L – 1 Crore', '1 – 2 Crore',
  '2 – 5 Crore', '5 – 10 Crore', '10+ Crore',
];

const SOURCE_OPTIONS = ['Social Media', 'Print Ad', 'TV/Radio', 'Referral', 'Walk-in', 'Website', 'Phone Enquiry'];

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col gap-1">
      <p className="text-[11px] uppercase tracking-widest font-medium" style={{ color: 'rgba(201,169,122,0.55)' }}>{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-white/40">{sub}</p>}
    </div>
  );
}

// ── Create Fair Modal ──────────────────────────────────────────────────────────

interface CreateFairModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateFairModal({ onClose, onCreated }: CreateFairModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateFairDto>({
    name: '', startDate: '', endDate: '', venue: '', city: '',
    description: '', targetVisitors: undefined,
  });

  const createMutation = useMutation({
    mutationFn: () => fairService.createFair(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fairs'] });
      toast.success('Fair created');
      onCreated();
    },
    onError: () => toast.error('Failed to create fair'),
  });

  const set = (field: keyof CreateFairDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const valid = form.name && form.startDate && form.endDate && form.venue && form.city;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: '#1A1614' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-white">Create Property Fair</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Fair Name *</label>
            <Input value={form.name} onChange={set('name')} placeholder="Sanmar Property Fair 2025" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Start Date *</label>
              <Input type="date" value={form.startDate} onChange={set('startDate')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">End Date *</label>
              <Input type="date" value={form.endDate} onChange={set('endDate')} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Venue *</label>
            <Input value={form.venue} onChange={set('venue')} placeholder="Radisson Blu, Chittagong" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">City *</label>
              <select
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
              >
                <option value="" disabled>Select city</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Dhaka">Dhaka</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Target Visitors</label>
              <Input
                type="number" min={1}
                value={form.targetVisitors ?? ''}
                onChange={e => setForm(f => ({ ...f, targetVisitors: e.target.value ? +e.target.value : undefined }))}
                placeholder="500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Brief description of the fair..."
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40 placeholder:text-white/25 resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary" size="sm"
            disabled={!valid || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? 'Creating…' : 'Create Fair'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Register Visitor Modal ─────────────────────────────────────────────────────

interface RegisterVisitorModalProps {
  fairId: string;
  onClose: () => void;
}

function RegisterVisitorModal({ fairId, onClose }: RegisterVisitorModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Omit<RegisterVisitorDto, 'fairId'>>({
    name: '', phone: '', email: '',
    registrationType: 'WALK_IN', source: '',
  });

  const regMutation = useMutation({
    mutationFn: () => fairService.registerVisitor({ ...form, fairId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fair-visitors', fairId] });
      qc.invalidateQueries({ queryKey: ['fair-summary', fairId] });
      toast.success('Visitor registered');
      onClose();
    },
    onError: () => toast.error('Failed to register visitor'),
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl" style={{ background: '#1A1614' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-white">Register Visitor</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Full Name *</label>
            <Input value={form.name} onChange={set('name')} placeholder="Visitor name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Phone *</label>
            <Input value={form.phone} onChange={set('phone')} placeholder="+8801XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Type</label>
              <select value={form.registrationType} onChange={set('registrationType')}
                className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40">
                <option value="WALK_IN">Walk-in</option>
                <option value="PRE_REGISTERED">Pre-registered</option>
                <option value="INVITED">Invited</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Source</label>
              <select value={form.source} onChange={set('source')}
                className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40">
                <option value="">Unknown</option>
                {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary" size="sm"
            disabled={!form.name || !form.phone || regMutation.isPending}
            onClick={() => regMutation.mutate()}
          >{regMutation.isPending ? 'Registering…' : 'Register'}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Capture Lead Modal ─────────────────────────────────────────────────────────

interface CaptureLeadModalProps {
  fairId: string;
  visitor: FairVisitor;
  onClose: () => void;
}

const PROJECT_OPTIONS = ['Sanmar Green Park', 'One Gulshan', 'Sanmar Heights', 'Sanmar Bay View'];

function CaptureLeadModal({ fairId, visitor, onClose }: CaptureLeadModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Omit<CaptureLeadDto, 'fairId' | 'visitorId'>>({
    interestedProjects: [],
    budgetRange:        '',
    interestLevel:      'WARM',
    requiresFollowUp:   true,
    notes:              '',
  });

  const toggleProject = (p: string) =>
    setForm(f => ({
      ...f,
      interestedProjects: f.interestedProjects?.includes(p)
        ? f.interestedProjects.filter(x => x !== p)
        : [...(f.interestedProjects ?? []), p],
    }));

  const captureMutation = useMutation({
    mutationFn: () => fairService.captureLead({ ...form, fairId, visitorId: visitor.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fair-leads', fairId] });
      qc.invalidateQueries({ queryKey: ['fair-summary', fairId] });
      qc.invalidateQueries({ queryKey: ['fair-visitors', fairId] });
      toast.success('Lead captured');
      onClose();
    },
    onError: () => toast.error('Failed to capture lead'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl" style={{ background: '#1A1614' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold text-white">Capture Lead</h2>
            <p className="text-xs text-white/40 mt-0.5">{visitor.name} · {visitor.phone}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Interest Level */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Interest Level</label>
            <div className="flex gap-2">
              {(['HOT', 'WARM', 'COLD'] as LeadInterestLevel[]).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setForm(f => ({ ...f, interestLevel: lvl }))}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                    form.interestLevel === lvl
                      ? INTEREST_STYLE[lvl] + ' border-current'
                      : 'border-white/10 text-white/40 hover:text-white/60'
                  }`}
                >
                  {INTEREST_ICON[lvl]} {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Interested Projects</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_OPTIONS.map(p => {
                const selected = form.interestedProjects?.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => toggleProject(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-[#C9A97A]/15 text-[#C9A97A] border-[#C9A97A]/30'
                        : 'border-white/10 text-white/40 hover:text-white/60'
                    }`}
                  >{p}</button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Budget Range</label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map(b => (
                <button
                  key={b}
                  onClick={() => setForm(f => ({ ...f, budgetRange: f.budgetRange === b ? '' : b }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.budgetRange === b
                      ? 'bg-[#C9A97A]/15 text-[#C9A97A] border-[#C9A97A]/30'
                      : 'border-white/10 text-white/40 hover:text-white/60'
                  }`}
                >{b}</button>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, requiresFollowUp: !f.requiresFollowUp }))}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                form.requiresFollowUp ? 'bg-[#C9A97A]' : 'bg-white/20'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${
                form.requiresFollowUp ? 'left-4' : 'left-0.5'
              }`} />
            </button>
            <span className="text-sm text-white/70">Requires follow-up</span>
          </div>
          {form.requiresFollowUp && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Follow-up Date</label>
              <Input type="date" value={form.followUpDate ?? ''} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Notes</label>
            <textarea
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40 placeholder:text-white/25 resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary" size="sm"
            disabled={captureMutation.isPending}
            onClick={() => captureMutation.mutate()}
          >{captureMutation.isPending ? 'Saving…' : 'Capture Lead'}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Fair Detail View ───────────────────────────────────────────────────────────

interface FairDetailProps {
  fair: Fair;
  onBack: () => void;
}

function FairDetail({ fair, onBack }: FairDetailProps) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'visitors' | 'leads'>('visitors');
  const [showRegModal, setShowRegModal] = useState(false);
  const [captureVisitor, setCaptureVisitor] = useState<FairVisitor | null>(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [visitorSearch, setVisitorSearch] = useState('');

  const { data: summary } = useQuery<FairSummary>({
    queryKey: ['fair-summary', fair.id],
    queryFn:  () => fairService.getFairSummary(fair.id),
  });

  const { data: visitors = [], isLoading: vLoading } = useQuery<FairVisitor[]>({
    queryKey: ['fair-visitors', fair.id],
    queryFn:  () => fairService.listVisitors(fair.id),
    enabled: tab === 'visitors',
  });

  const { data: leads = [], isLoading: lLoading } = useQuery<FairLead[]>({
    queryKey: ['fair-leads', fair.id],
    queryFn:  () => fairService.listLeads(fair.id),
    enabled: tab === 'leads',
  });

  const checkInMutation = useMutation({
    mutationFn: (visitorId: string) => fairService.checkInVisitor(visitorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fair-visitors', fair.id] });
      qc.invalidateQueries({ queryKey: ['fair-summary', fair.id] });
      toast.success('Checked in');
    },
    onError: () => toast.error('Check-in failed'),
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: ({ leadId, dto }: { leadId: string; dto: UpdateLeadDto }) =>
      fairService.updateLead(leadId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fair-leads', fair.id] });
      qc.invalidateQueries({ queryKey: ['fair-summary', fair.id] });
      toast.success('Lead updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: Fair['status']) => fairService.updateFair(fair.id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fairs'] });
      toast.success('Status updated');
    },
  });

  const filteredVisitors = useMemo(() => {
    if (!visitorSearch) return visitors;
    const q = visitorSearch.toLowerCase();
    return visitors.filter(v => v.name.toLowerCase().includes(q) || v.phone.includes(q));
  }, [visitors, visitorSearch]);

  const filteredLeads = useMemo(() => {
    if (!leadSearch) return leads;
    const q = leadSearch.toLowerCase();
    return leads.filter(l =>
      l.visitor.name.toLowerCase().includes(q) ||
      l.visitor.phone.includes(q) ||
      l.interestedProjects.some(p => p.toLowerCase().includes(q)),
    );
  }, [leads, leadSearch]);

  const canChangeStatus = fair.status !== 'CANCELLED' && fair.status !== 'COMPLETED';
  const nextStatus: Partial<Record<Fair['status'], Fair['status']>> = {
    UPCOMING: 'ACTIVE',
    ACTIVE:   'COMPLETED',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Fairs
        </button>
        <div className="flex items-center gap-3">
          {canChangeStatus && nextStatus[fair.status] && (
            <Button
              variant="outline" size="sm"
              onClick={() => statusMutation.mutate(nextStatus[fair.status]!)}
            >
              Mark {nextStatus[fair.status] === 'ACTIVE' ? 'Active' : 'Completed'}
            </Button>
          )}
          {tab === 'visitors' && fair.status !== 'CANCELLED' && (
            <Button variant="primary" size="sm" icon={<Plus size={14} />}
              onClick={() => setShowRegModal(true)}>
              Register Visitor
            </Button>
          )}
        </div>
      </div>

      {/* Fair header */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold text-white">{fair.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${FAIR_STATUS_STYLE[fair.status]}`}>
                {FAIR_STATUS_LABEL[fair.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
              <span className="flex items-center gap-1.5"><CalendarDays size={13} />{fmtDateRange(fair.startDate, fair.endDate)}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} />{fair.venue}</span>
              <span className="text-white/30">{fair.city}</span>
            </div>
            {fair.description && <p className="mt-2 text-sm text-white/40">{fair.description}</p>}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Visitors" value={summary.totalVisitors}
            sub={summary.targetVisitors ? `of ${summary.targetVisitors} target` : undefined} />
          <StatCard label="Checked In" value={summary.checkedIn}
            sub={summary.noShow > 0 ? `${summary.noShow} no-show` : 'all present'} />
          <StatCard label="Leads Captured" value={summary.totalLeads}
            sub={`Conversion: ${summary.conversionRate}`} />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-widest font-medium mb-1" style={{ color: 'rgba(201,169,122,0.55)' }}>
              By Interest
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-red-400"><Flame size={13} />{summary.byInterestLevel.HOT}</span>
              <span className="flex items-center gap-1 text-amber-400"><Thermometer size={13} />{summary.byInterestLevel.WARM}</span>
              <span className="flex items-center gap-1 text-blue-400"><Snowflake size={13} />{summary.byInterestLevel.COLD}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] w-fit mb-5 border border-white/[0.06]">
        {(['visitors', 'leads'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'visitors' ? `Visitors (${summary?.totalVisitors ?? 0})` : `Leads (${summary?.totalLeads ?? 0})`}
          </button>
        ))}
      </div>

      {/* Visitors Tab */}
      {tab === 'visitors' && (
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={visitorSearch} onChange={e => setVisitorSearch(e.target.value)}
                placeholder="Search visitors…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
              />
            </div>
          </div>

          {vLoading ? <SkeletonTable rows={6} /> : filteredVisitors.length === 0 ? (
            <EmptyState
              title="No visitors yet"
              hint="Register the first visitor for this fair"
              action={{ label: 'Register Visitor', onClick: () => setShowRegModal(true) }}
            />
          ) : (
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Name', 'Phone', 'Type', 'Source', 'Leads', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredVisitors.map(v => (
                    <tr key={v.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{v.name}</td>
                      <td className="px-4 py-3 text-white/60 font-mono text-xs">{v.phone}</td>
                      <td className="px-4 py-3 text-white/50 text-xs">{v.registrationType?.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{v.source || '—'}</td>
                      <td className="px-4 py-3">
                        {(v.leads?.length ?? 0) > 0
                          ? <span className="text-[#C9A97A] font-medium text-xs">{v.leads!.length} lead{v.leads!.length > 1 ? 's' : ''}</span>
                          : <span className="text-white/20 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {v.checkedIn
                          ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={12} /> Checked in</span>
                          : <span className="text-white/30 text-xs">Not arrived</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!v.checkedIn && (
                            <button
                              onClick={() => checkInMutation.mutate(v.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-white/60 border border-white/10 hover:border-[#C9A97A]/40 hover:text-[#C9A97A] transition-colors"
                            >
                              <UserCheck size={12} /> Check in
                            </button>
                          )}
                          <button
                            onClick={() => setCaptureVisitor(v)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-white/60 border border-white/10 hover:border-[#C9A97A]/40 hover:text-[#C9A97A] transition-colors"
                          >
                            <Star size={12} /> Lead
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leads Tab */}
      {tab === 'leads' && (
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                placeholder="Search leads…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
              />
            </div>
          </div>

          {lLoading ? <SkeletonTable rows={6} /> : filteredLeads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              hint="Capture leads from registered visitors"
            />
          ) : (
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Visitor', 'Interest', 'Projects', 'Budget', 'Status', 'Follow-up'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredLeads.map(l => (
                    <tr key={l.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{l.visitor.name}</p>
                        <p className="text-xs text-white/40 font-mono">{l.visitor.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${INTEREST_STYLE[l.interestLevel]}`}>
                          {INTEREST_ICON[l.interestLevel]} {l.interestLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {l.interestedProjects.length > 0
                            ? l.interestedProjects.map(p => (
                              <span key={p} className="text-xs text-white/60">{p}</span>
                            ))
                            : <span className="text-white/20 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs">{l.budgetRange || '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={l.status}
                          onChange={e => updateLeadStatusMutation.mutate({
                            leadId: l.id, dto: { status: e.target.value as LeadStatus },
                          })}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${LEAD_STATUS_STYLE[l.status]}`}
                          style={{ background: 'transparent' }}
                        >
                          {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map(s => (
                            <option key={s} value={s} style={{ background: '#1A1614', color: '#fff' }}>
                              {LEAD_STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {l.followUpDate ? fmtDate(l.followUpDate) : (l.requiresFollowUp ? <span className="text-amber-400/70">Pending date</span> : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showRegModal && (
        <RegisterVisitorModal fairId={fair.id} onClose={() => setShowRegModal(false)} />
      )}
      {captureVisitor && (
        <CaptureLeadModal fairId={fair.id} visitor={captureVisitor} onClose={() => setCaptureVisitor(null)} />
      )}
    </div>
  );
}

// ── Fair Card ──────────────────────────────────────────────────────────────────

interface FairCardProps {
  fair: Fair;
  onClick: () => void;
}

function FairCard({ fair, onClick }: FairCardProps) {
  const visitors = fair._count?.visitors ?? 0;
  const leads    = fair._count?.leads    ?? 0;

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 cursor-pointer transition-all hover:border-white/10"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-white group-hover:text-[#C9A97A] transition-colors">{fair.name}</h3>
          <p className="text-xs text-white/40 mt-0.5">{fair.city} · {fmtDateRange(fair.startDate, fair.endDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${FAIR_STATUS_STYLE[fair.status]}`}>
            {FAIR_STATUS_LABEL[fair.status]}
          </span>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
        </div>
      </div>

      <p className="text-xs text-white/40 flex items-center gap-1 mb-4">
        <MapPin size={11} /> {fair.venue}
      </p>

      <div className="flex items-center gap-5 text-sm">
        <div className="flex items-center gap-1.5 text-white/60">
          <Users size={13} className="text-white/30" />
          <span className="font-medium text-white">{visitors}</span>
          <span className="text-xs text-white/30">visitors</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60">
          <TrendingUp size={13} className="text-white/30" />
          <span className="font-medium text-white">{leads}</span>
          <span className="text-xs text-white/30">leads</span>
        </div>
        {fair.targetVisitors && (
          <div className="ml-auto">
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C9A97A]/60 transition-all"
                  style={{ width: `${Math.min(100, (visitors / fair.targetVisitors) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-white/30">{Math.round((visitors / fair.targetVisitors) * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type FilterTab = 'ALL' | FairStatus;
const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Active',    value: 'ACTIVE' },
  { label: 'Upcoming',  value: 'UPCOMING' },
  { label: 'Completed', value: 'COMPLETED' },
];

export function FairsPage() {
  const { user } = useAuth();
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [search, setSearch]       = useState('');
  const [selectedFair, setSelectedFair] = useState<Fair | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'CORPORATE_ADMIN'].includes(user?.role ?? '');

  const { data: fairs = [], isLoading } = useQuery<Fair[]>({
    queryKey: ['fairs'],
    queryFn:  () => fairService.listFairs(),
  });

  const filtered = useMemo(() => {
    let list = filterTab === 'ALL' ? fairs : fairs.filter(f => f.status === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.venue.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q),
      );
    }
    return list;
  }, [fairs, filterTab, search]);

  // If a fair is selected, show detail view
  if (selectedFair) {
    return (
      <AppShell>
        <Header title="Property Fairs" />
        <div className="p-6 flex flex-col min-h-full">
          <FairDetail fair={selectedFair} onBack={() => setSelectedFair(null)} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="Property Fairs"
        action={isAdmin ? (
          <Button variant="primary" size="sm" icon={<Plus size={14} />}
            onClick={() => setShowCreateModal(true)}>
            New Fair
          </Button>
        ) : undefined}
      />

      <div className="p-6">
        {/* Filter tabs + search */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {FILTER_TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setFilterTab(t.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterTab === t.value
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {t.label}
                {t.value !== 'ALL' && (
                  <span className="ml-1.5 text-[10px] text-white/30">
                    {fairs.filter(f => f.status === t.value).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search fairs…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse">
                <div className="h-5 w-3/4 rounded bg-white/10 mb-3" />
                <div className="h-3 w-1/2 rounded bg-white/5 mb-6" />
                <div className="h-3 w-2/3 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No fairs match your search' : 'No fairs yet'}
            hint={search ? 'Try a different search term' : 'Create the first property fair to get started'}
            action={isAdmin ? { label: 'Create Fair', onClick: () => setShowCreateModal(true) } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(f => (
              <FairCard key={f.id} fair={f} onClick={() => setSelectedFair(f)} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateFairModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </AppShell>
  );
}

export default FairsPage;
