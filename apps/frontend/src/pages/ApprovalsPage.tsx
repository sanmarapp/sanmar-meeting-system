import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CalendarDays, Clock, Users, Building2,
  CheckCircle2, XCircle, ChevronRight, User,
} from 'lucide-react';
import { bookingService, type Booking } from '../services/bookingService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { SkeletonListItem } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';

// ─── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const MEETING_TYPE_LABEL: Record<string, string> = {
  INTERNAL: 'Internal', CLIENT: 'Client', BOARD: 'Board', TRAINING: 'Training', OTHER: 'Other',
};

// ─── Approvals Page ────────────────────────────────────────────
export function ApprovalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc       = useQueryClient();

  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'CORPORATE_ADMIN'].includes(user?.role ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'pending-approvals'],
    queryFn:  () => bookingService.list({ status: 'PENDING', limit: 50 }),
    enabled:  isAdmin,
  });

  const pending = data?.data ?? [];
  const total   = data?.total ?? 0;

  const invalidate = () => qc.invalidateQueries({ queryKey: ['bookings'] });

  const approveMut = useMutation({
    mutationFn: (id: string) => bookingService.approve(id),
    onSuccess:  () => { toast.success('Booking approved'); invalidate(); },
    onError:    () => toast.error('Failed to approve'),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => bookingService.reject(id),
    onSuccess:  () => { toast.success('Booking rejected'); invalidate(); },
    onError:    () => toast.error('Failed to reject'),
  });

  if (!isAdmin) {
    return (
      <AppShell>
        <Header title="Approvals" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            variant="access"
            title="Admin access required"
            hint="Only Admins can review and action booking approvals."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="Approvals"
        subtitle={
          isLoading
            ? 'Loading…'
            : total > 0
              ? `${total} booking${total !== 1 ? 's' : ''} awaiting review`
              : 'All caught up'
        }
      />

      <div className="flex-1 px-5 py-5 space-y-4 animate-fade-in">

        {/* ── Summary banner ── */}
        {!isLoading && total > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-normal animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(217,119,6,0.07) 0%, rgba(217,119,6,0.04) 100%)',
              border: '1px solid rgba(217,119,6,0.18)',
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-warning-50 flex items-center justify-center shrink-0">
              <Clock size={14} strokeWidth={1.75} className="text-warning-600" />
            </div>
            <p style={{ color: '#92400E' }}>
              {total} pending booking{total !== 1 ? 's' : ''} require your action.
              Review each request below and approve or reject.
            </p>
          </div>
        )}

        {/* ── List ── */}
        <div className="bg-white border border-neutral-150 rounded-xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)}
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              variant="generic"
              title="No pending approvals"
              hint="All booking requests have been reviewed. New submissions will appear here."
            />
          ) : (
            <ul className="divide-y divide-neutral-75">
              {pending.map((b: Booking) => (
                <ApprovalItem
                  key={b.id}
                  booking={b}
                  onView={() => navigate(`/bookings/${b.id}`)}
                  onApprove={() => approveMut.mutate(b.id)}
                  onReject={() => rejectMut.mutate(b.id)}
                  approving={approveMut.isPending && approveMut.variables === b.id}
                  rejecting={rejectMut.isPending && rejectMut.variables === b.id}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// ─── Approval item ─────────────────────────────────────────────
function ApprovalItem({
  booking: b,
  onView,
  onApprove,
  onReject,
  approving,
  rejecting,
}: {
  booking:   Booking;
  onView:    () => void;
  onApprove: () => void;
  onReject:  () => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const busy = approving || rejecting;

  return (
    <li className="px-5 py-4 hover:bg-neutral-25 transition-colors">
      <div className="flex items-start gap-3.5">
        {/* Pending indicator */}
        <div className="mt-1.5 w-2 h-2 rounded-full bg-warning-500 shrink-0 animate-pulse-dot" />

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-normal text-neutral-900 truncate">{b.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {MEETING_TYPE_LABEL[b.meetingType] ?? b.meetingType}
              </p>
            </div>
            <button
              onClick={onView}
              className="flex items-center gap-1 text-xs font-normal shrink-0 transition-colors"
              style={{ color: '#826B52' }}
            >
              View details
              <ChevronRight size={11} strokeWidth={2} />
            </button>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
            <MetaChip icon={<Building2 size={11} strokeWidth={1.75} />} label={b.room.name} />
            <MetaChip icon={<CalendarDays size={11} strokeWidth={1.75} />} label={fmtDate(b.startTime)} />
            <MetaChip
              icon={<Clock size={11} strokeWidth={1.75} />}
              label={`${fmtTime(b.startTime)} – ${fmtTime(b.endTime)}`}
            />
            <MetaChip icon={<Users size={11} strokeWidth={1.75} />} label={`${b.attendeeCount} attendees`} />
            <MetaChip
              icon={<User size={11} strokeWidth={1.75} />}
              label={b.department ? `${b.createdBy.name} · ${b.department.name}` : b.createdBy.name}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3.5">
            <Button
              variant="primary"
              size="xs"
              icon={<CheckCircle2 size={12} strokeWidth={2} />}
              loading={approving}
              disabled={busy}
              onClick={onApprove}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="xs"
              icon={<XCircle size={12} strokeWidth={2} />}
              loading={rejecting}
              disabled={busy}
              onClick={onReject}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

// ─── Meta chip ─────────────────────────────────────────────────
function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-neutral-500">
      <span className="text-neutral-300">{icon}</span>
      {label}
    </span>
  );
}

export default ApprovalsPage;
