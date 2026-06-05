import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, MapPin, CalendarDays, Clock, User,
  Phone, Mail, Ban, MessageSquare, CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { siteVisitService, type SiteVisit } from '../services/siteVisitService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { visitStatusVariant } from '../components/ui/Badge';
import { Card, CardHeader, CardDivider } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';

// ─── Config ────────────────────────────────────────────────────
const VISIT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW:   'No Show',
};

const SITE_READY_LABEL: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  READY:     { label: 'Site Ready',      variant: 'success' },
  NOT_READY: { label: 'Site Not Ready',  variant: 'danger'  },
  PARTIAL:   { label: 'Partially Ready', variant: 'warning' },
};

// ─── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function fmtTime(t: string) {
  if (t.includes('T')) return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return t.slice(0, 5);
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Component ─────────────────────────────────────────────────
export function SiteVisitDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc       = useQueryClient();

  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: visit, isLoading, error } = useQuery<SiteVisit>({
    queryKey: ['site-visits', id],
    queryFn:  () => siteVisitService.getById(id!),
    enabled:  !!id,
  });

  const isAdmin  = user?.role === 'ADMIN' || user?.role === 'CORPORATE_ADMIN';
  const isOwner  = visit?.bookedBy?.id === user?.id;
  const canCancel = (isOwner || isAdmin) && visit?.status === 'SCHEDULED';

  const cancelMut = useMutation({
    mutationFn: () => siteVisitService.cancel(id!),
    onSuccess: () => {
      toast.success('Site visit cancelled');
      setConfirmCancel(false);
      qc.invalidateQueries({ queryKey: ['site-visits'] });
    },
    onError: () => toast.error('Failed to cancel visit'),
  });

  // ── Loading / error states ──────────────────────────────────
  if (isLoading) {
    return (
      <AppShell>
        <Header title="Site Visit" />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 max-w-4xl">
            <div className="space-y-5">
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-[140px] rounded-xl" />
            </div>
            <Skeleton className="h-[260px] rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !visit) {
    return (
      <AppShell>
        <Header title="Visit Not Found"
          action={<Button variant="ghost" size="sm" icon={<ArrowLeft size={13} strokeWidth={2} />} onClick={() => navigate('/site-visits')}>Back</Button>}
        />
        <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
          This visit could not be found or you don't have access.
        </div>
      </AppShell>
    );
  }

  const siteReady = visit.siteReadyStatus ? SITE_READY_LABEL[visit.siteReadyStatus] : null;

  return (
    <AppShell>
      <Header
        title={visit.client.name}
        subtitle={`Site visit · ${visit.site.name}`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={visitStatusVariant(visit.status)}>
              {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
            </Badge>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} strokeWidth={2} />} onClick={() => navigate('/site-visits')}>
              Back
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 animate-fade-in">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 max-w-4xl">

          {/* ── Left: details ── */}
          <div className="space-y-5">

            {/* Visit info */}
            <Card>
              <CardHeader title="Visit Details" subtitle={`Recorded ${fmtDateTime(visit.createdAt)}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <DetailRow icon={<User size={15} strokeWidth={1.75} />} label="Client">
                  <p className="text-sm font-normal text-neutral-800">{visit.client.name}</p>
                  {visit.client.email && (
                    <a href={`mailto:${visit.client.email}`}
                      className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-700 mt-0.5 transition-colors">
                      <Mail size={11} strokeWidth={1.75} /> {visit.client.email}
                    </a>
                  )}
                  {visit.client.phone && (
                    <a href={`tel:${visit.client.phone}`}
                      className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 mt-0.5 transition-colors">
                      <Phone size={11} strokeWidth={1.75} /> {visit.client.phone}
                    </a>
                  )}
                </DetailRow>

                <DetailRow icon={<MapPin size={15} strokeWidth={1.75} />} label="Property / Site">
                  <p className="text-sm font-normal text-neutral-800">{visit.site.name}</p>
                  {visit.site.address && (
                    <p className="text-xs text-neutral-400 mt-0.5">{visit.site.address}</p>
                  )}
                </DetailRow>

                <DetailRow icon={<CalendarDays size={15} strokeWidth={1.75} />} label="Visit Date">
                  <p className="text-sm font-normal text-neutral-800">{fmtDate(visit.visitDate)}</p>
                </DetailRow>

                <DetailRow icon={<Clock size={15} strokeWidth={1.75} />} label="Visit Time">
                  <p className="text-sm font-normal text-neutral-800">{fmtTime(visit.visitTime)}</p>
                </DetailRow>

                <DetailRow icon={<User size={15} strokeWidth={1.75} />} label="Booked By">
                  <p className="text-sm font-normal text-neutral-800">{visit.bookedBy.name}</p>
                </DetailRow>

                {siteReady && (
                  <DetailRow icon={<CheckCircle2 size={15} strokeWidth={1.75} />} label="Site Status">
                    <Badge variant={siteReady.variant}>{siteReady.label}</Badge>
                  </DetailRow>
                )}
              </div>

              {visit.notes && (
                <>
                  <CardDivider />
                  <div className="flex items-start gap-2.5">
                    <MessageSquare size={14} strokeWidth={1.75} className="text-neutral-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Notes</p>
                      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{visit.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Status context */}
            {(visit.status === 'CANCELLED' || visit.status === 'NO_SHOW') && (
              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(239,68,68,0.08)' }}>
                    <AlertTriangle size={16} strokeWidth={1.75} className="text-danger" />
                  </div>
                  <div>
                    <p className="text-sm font-normal text-neutral-800">
                      {visit.status === 'CANCELLED' ? 'Visit Cancelled' : 'Client No Show'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {visit.status === 'CANCELLED'
                        ? 'This site visit was cancelled and is no longer active.'
                        : 'The client did not attend this scheduled visit.'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* ── Right: status + actions ── */}
          <div className="space-y-4">

            {/* Status card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-normal text-neutral-700">Status</p>
                <Badge variant={visitStatusVariant(visit.status)}>
                  {VISIT_STATUS_LABEL[visit.status] ?? visit.status}
                </Badge>
              </div>

              {/* Timeline */}
              <VisitTimeline status={visit.status} />
            </Card>

            {/* Cancel action */}
            {canCancel && (
              <Card>
                <CardHeader title="Actions" />
                {confirmCancel ? (
                  <div className="space-y-2">
                    <p className="text-xs text-neutral-500 text-center">
                      Cancel this site visit? This cannot be undone.
                    </p>
                    <Button
                      variant="danger" size="sm" fullWidth
                      loading={cancelMut.isPending}
                      icon={<Ban size={13} strokeWidth={2} />}
                      onClick={() => cancelMut.mutate()}
                    >
                      Yes, Cancel Visit
                    </Button>
                    <Button variant="ghost" size="sm" fullWidth onClick={() => setConfirmCancel(false)}>
                      Keep Visit
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline" size="sm" fullWidth
                    icon={<Ban size={13} strokeWidth={2} />}
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancel Visit
                  </Button>
                )}
              </Card>
            )}

            {/* Meta */}
            <Card padding="sm">
              <dl className="space-y-2.5">
                <MetaRow label="Visit ID" value={<code className="text-xs font-mono text-neutral-500">{visit.id.slice(0, 8)}…</code>} />
                <MetaRow label="Created" value={fmtDateTime(visit.createdAt)} />
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Detail row ────────────────────────────────────────────────
function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-neutral-300 shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-neutral-400">{label}</dt>
      <dd className="text-xs font-normal text-neutral-600 text-right">{value}</dd>
    </div>
  );
}

// ─── Visit timeline ────────────────────────────────────────────
function VisitTimeline({ status }: { status: string }) {
  const cancelled = status === 'CANCELLED';
  const noShow    = status === 'NO_SHOW';

  if (cancelled || noShow) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
        <span className="text-xs text-danger font-normal">
          {cancelled ? 'Visit cancelled' : 'Client no-show'}
        </span>
      </div>
    );
  }

  const steps = [
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'COMPLETED', label: 'Completed' },
  ];
  const activeIdx = steps.findIndex(s => s.key === status);

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const done    = i <= activeIdx;
        const current = i === activeIdx;
        return (
          <div key={step.key} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: done ? (current ? 'var(--brand)' : 'var(--gold-light)') : 'var(--bg-subtle)', border: current ? '2px solid var(--brand)' : 'none' }}>
              {done && !current && (
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#C9A97A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {current && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
            </div>
            <span className={`text-xs font-normal ${done ? 'text-neutral-700' : 'text-neutral-300'}`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default SiteVisitDetailPage;
