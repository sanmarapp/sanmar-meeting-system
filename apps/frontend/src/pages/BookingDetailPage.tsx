import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Building2, CalendarDays, Clock, Users,
  CheckCircle2, XCircle, Ban, User, Briefcase,
  MessageSquare, Settings2, Loader2,
} from 'lucide-react';
import { bookingService, type Booking } from '../services/bookingService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Badge, bookingStatusVariant, bookingStatusLabel } from '../components/ui/Badge';
import { Card, CardHeader, CardDivider } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';

// ─── Config ────────────────────────────────────────────────────
const MEETING_TYPE_LABEL: Record<string, string> = {
  INTERNAL: 'Internal', CLIENT: 'Client', BOARD: 'Board',
  TRAINING: 'Training', OTHER: 'Other',
};

// ─── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function durationLabel(start: string, end: string) {
  const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  if (mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
}

// ─── Component ─────────────────────────────────────────────────
export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const qc        = useQueryClient();

  const [rejectReason, setRejectReason]       = useState('');
  const [showRejectForm, setShowRejectForm]   = useState(false);
  const [confirmCancel, setConfirmCancel]     = useState(false);

  // ── Data ───────────────────────────────────────────────────
  const { data: booking, isLoading, error } = useQuery<Booking>({
    queryKey: ['bookings', id],
    queryFn:  () => bookingService.getById(id!),
    enabled:  !!id,
  });

  // ── Permissions ────────────────────────────────────────────
  const isAdmin   = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isOwner   = booking?.createdBy?.id === user?.id;
  const canApprove = isAdmin && booking?.status === 'PENDING';
  const canCancel  = (isOwner || isAdmin) &&
    (booking?.status === 'PENDING' || booking?.status === 'APPROVED');

  // ── Mutations ──────────────────────────────────────────────
  const invalidate = () => qc.invalidateQueries({ queryKey: ['bookings'] });

  const approveMut = useMutation({
    mutationFn: () => bookingService.approve(id!),
    onSuccess: () => {
      toast.success('Booking approved', { description: 'The requester has been notified.' });
      invalidate();
    },
    onError: () => toast.error('Failed to approve booking'),
  });

  const rejectMut = useMutation({
    mutationFn: () => bookingService.reject(id!, rejectReason.trim() || undefined),
    onSuccess: () => {
      toast.success('Booking rejected');
      setShowRejectForm(false);
      invalidate();
    },
    onError: () => toast.error('Failed to reject booking'),
  });

  const cancelMut = useMutation({
    mutationFn: () => bookingService.cancel(id!),
    onSuccess: () => {
      toast.success('Booking cancelled');
      setConfirmCancel(false);
      invalidate();
    },
    onError: () => toast.error('Failed to cancel booking'),
  });

  // ── Loading / error ────────────────────────────────────────
  if (isLoading) {
    return (
      <AppShell>
        <Header title="Booking Detail" />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 max-w-5xl">
            <div className="space-y-5">
              <Skeleton className="h-[220px] rounded-xl w-full" />
              <Skeleton className="h-[180px] rounded-xl w-full" />
            </div>
            <Skeleton className="h-[320px] rounded-xl w-full" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !booking) {
    return (
      <AppShell>
        <Header
          title="Booking Not Found"
          action={
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} strokeWidth={2} />} onClick={() => navigate('/bookings')}>
              Back
            </Button>
          }
        />
        <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
          This booking could not be found or you don't have access.
        </div>
      </AppShell>
    );
  }

  const duration = durationLabel(booking.startTime, booking.endTime);

  return (
    <AppShell>
      <Header
        title={booking.title}
        subtitle={`${MEETING_TYPE_LABEL[booking.meetingType] ?? booking.meetingType} meeting`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={bookingStatusVariant(booking.status)}>
              {bookingStatusLabel(booking.status)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={13} strokeWidth={2} />}
              onClick={() => navigate('/bookings')}
            >
              Back
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 animate-fade-in">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 max-w-5xl">

          {/* ── Left col: details ── */}
          <div className="space-y-5">

            {/* Meeting info */}
            <Card>
              <CardHeader
                title="Meeting Details"
                subtitle={`Requested ${fmtDateTime(booking.createdAt)}`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailRow
                  icon={<Building2 size={15} strokeWidth={1.75} />}
                  label="Room"
                  value={
                    <span>
                      {booking.room.name}
                      {booking.room.location && (
                        <span className="text-neutral-400"> · {booking.room.location.name}</span>
                      )}
                    </span>
                  }
                />
                <DetailRow
                  icon={<CalendarDays size={15} strokeWidth={1.75} />}
                  label="Date"
                  value={fmtDate(booking.startTime)}
                />
                <DetailRow
                  icon={<Clock size={15} strokeWidth={1.75} />}
                  label="Time"
                  value={
                    <span>
                      {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}
                      <span
                        className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(130,107,82,0.08)', color: '#826B52' }}
                      >
                        {duration}
                      </span>
                    </span>
                  }
                />
                <DetailRow
                  icon={<Users size={15} strokeWidth={1.75} />}
                  label="Attendees"
                  value={`${booking.attendeeCount} ${booking.attendeeCount === 1 ? 'person' : 'people'}`}
                />
                <DetailRow
                  icon={<User size={15} strokeWidth={1.75} />}
                  label="Requested By"
                  value={
                    <span>
                      {booking.createdBy.name}
                      <span className="text-neutral-400 text-xs ml-1">({booking.createdBy.email})</span>
                    </span>
                  }
                />
                {booking.department && (
                  <DetailRow
                    icon={<Briefcase size={15} strokeWidth={1.75} />}
                    label="Department"
                    value={booking.department.name}
                  />
                )}
              </div>

              {booking.description && (
                <>
                  <CardDivider />
                  <div>
                    <p className="text-xs font-normal text-neutral-400 uppercase tracking-wide mb-2">Description</p>
                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{booking.description}</p>
                  </div>
                </>
              )}
            </Card>

            {/* Notes / requirements */}
            {booking.approvalStatus || (booking as any).notes || (booking as any).requiresRefreshment ? (
              <Card>
                <CardHeader title="Additional Information" />
                <div className="space-y-3">
                  {(booking as any).requiresRefreshment && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <CheckCircle2 size={14} strokeWidth={1.75} className="text-success shrink-0" />
                      Refreshments requested
                    </div>
                  )}
                  {(booking as any).arrangementType && (
                    <div className="flex items-start gap-2">
                      <Settings2 size={14} strokeWidth={1.75} className="text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-neutral-400">Room Arrangement</p>
                        <p className="text-sm text-neutral-700">{(booking as any).arrangementType}</p>
                      </div>
                    </div>
                  )}
                  {(booking as any).notes && (
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} strokeWidth={1.75} className="text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Notes</p>
                        <p className="text-sm text-neutral-700 leading-relaxed">{(booking as any).notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : null}

            {/* Approval record */}
            {(booking.status === 'APPROVED' || booking.status === 'REJECTED') && booking.approver && (
              <Card>
                <CardHeader
                  title={booking.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                />
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-normal shrink-0"
                    style={{ background: booking.status === 'APPROVED' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: booking.status === 'APPROVED' ? '#16a34a' : '#dc2626' }}
                  >
                    {booking.approver.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-normal text-neutral-800">{booking.approver.name}</p>
                    <p className="text-xs text-neutral-400">
                      {booking.status === 'APPROVED' ? 'Approved' : 'Rejected'} this booking
                    </p>
                  </div>
                </div>
                {booking.approvalStatus && (
                  <div className="mt-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <p className="text-xs text-neutral-400 mb-1">Reason</p>
                    <p className="text-sm text-neutral-700">{booking.approvalStatus}</p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* ── Right col: actions ── */}
          <div className="space-y-4">

            {/* Status card */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-normal text-neutral-700">Status</p>
                <Badge variant={bookingStatusVariant(booking.status)}>
                  {bookingStatusLabel(booking.status)}
                </Badge>
              </div>

              {/* Status timeline */}
              <StatusTimeline status={booking.status} />
            </Card>

            {/* Action card */}
            {(canApprove || canCancel) && (
              <Card>
                <CardHeader title="Actions" />

                <div className="space-y-2.5">
                  {/* Approve */}
                  {canApprove && !showRejectForm && (
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      loading={approveMut.isPending}
                      icon={<CheckCircle2 size={14} strokeWidth={2} />}
                      onClick={() => approveMut.mutate()}
                    >
                      Approve Booking
                    </Button>
                  )}

                  {/* Reject toggle */}
                  {canApprove && !showRejectForm && (
                    <Button
                      variant="danger"
                      size="md"
                      fullWidth
                      icon={<XCircle size={14} strokeWidth={2} />}
                      onClick={() => setShowRejectForm(true)}
                    >
                      Reject Booking
                    </Button>
                  )}

                  {/* Reject form */}
                  {showRejectForm && (
                    <div className="space-y-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-normal text-neutral-600">Reason for rejection</label>
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Briefly explain why this booking is being rejected…"
                          className={
                            'w-full px-3 py-2 text-sm font-sans min-h-[80px] resize-none ' +
                            'bg-white text-neutral-900 placeholder:text-neutral-400 ' +
                            'border border-neutral-200 rounded-md ' +
                            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10'
                          }
                        />
                        <p className="text-xs text-neutral-400">Optional but recommended.</p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        fullWidth
                        loading={rejectMut.isPending}
                        icon={<XCircle size={13} strokeWidth={2} />}
                        onClick={() => rejectMut.mutate()}
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Cancel — owner or admin */}
                  {canCancel && !showRejectForm && (
                    <>
                      {canApprove && <CardDivider />}
                      {confirmCancel ? (
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-500 text-center">Are you sure? This cannot be undone.</p>
                          <Button
                            variant="danger"
                            size="sm"
                            fullWidth
                            loading={cancelMut.isPending}
                            icon={cancelMut.isPending ? undefined : <Ban size={13} strokeWidth={2} />}
                            onClick={() => cancelMut.mutate()}
                          >
                            Yes, Cancel Booking
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            onClick={() => setConfirmCancel(false)}
                          >
                            Keep Booking
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          icon={<Ban size={13} strokeWidth={2} />}
                          onClick={() => setConfirmCancel(true)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Meta */}
            <Card padding="sm">
              <dl className="space-y-2.5">
                <MetaRow label="Booking ID" value={<code className="text-xs font-mono text-neutral-500">{booking.id.slice(0, 8)}…</code>} />
                <MetaRow label="Created" value={fmtDateTime(booking.createdAt)} />
                {booking.approver && (
                  <MetaRow label="Approver" value={booking.approver.name} />
                )}
              </dl>
            </Card>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

// ─── Detail row ────────────────────────────────────────────────
function DetailRow({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-neutral-300 shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm font-normal text-neutral-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Meta row ──────────────────────────────────────────────────
function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-neutral-400">{label}</dt>
      <dd className="text-xs font-normal text-neutral-600 text-right">{value}</dd>
    </div>
  );
}

// ─── Status timeline ───────────────────────────────────────────
function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'PENDING',   label: 'Submitted' },
    { key: 'APPROVED',  label: 'Approved' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const isRejected  = status === 'REJECTED';
  const isCancelled = status === 'CANCELLED';

  if (isRejected || isCancelled) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
        <span className="text-xs text-danger font-normal">
          {isRejected ? 'Booking rejected' : 'Booking cancelled'}
        </span>
      </div>
    );
  }

  const activeIdx = steps.findIndex(s => s.key === status);

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const done    = i <= activeIdx;
        const current = i === activeIdx;
        return (
          <div key={step.key} className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
              style={{
                background: done ? (current ? '#826B52' : 'rgba(130,107,82,0.15)') : '#F5F3F0',
                border: current ? '2px solid #826B52' : 'none',
              }}
            >
              {done && !current && (
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#826B52" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {current && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
            </div>
            <span className={`text-xs font-normal ${done ? 'text-neutral-700' : 'text-neutral-300'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BookingDetailPage;
