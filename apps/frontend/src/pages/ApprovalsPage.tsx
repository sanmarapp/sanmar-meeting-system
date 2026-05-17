import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CalendarDays, Clock, Users, Building2,
  CheckCircle2, XCircle, ChevronRight, User, Briefcase,
} from 'lucide-react';
import { bookingService, type Booking } from '../services/bookingService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
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

// ─── Component ─────────────────────────────────────────────────
export function ApprovalsPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const qc        = useQueryClient();
  const isAdmin   = user?.role === 'ADMIN' || user?.role === 'MANAGER';

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
          <EmptyState variant="access" title="Admin access required" hint="Only Admins and Managers can review approvals." />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="Approvals"
        subtitle={
          isLoading ? 'Loading…'
            : total > 0 ? `${total} booking${total !== 1 ? 's' : ''} awaiting review`
            : 'All caught up'
        }
      />

      <div className="flex-1 p-6 space-y-4 animate-fade-in">

        {/* ── Summary banner ── */}
        {!isLoading && total > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-normal"
            style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)', color: '#92400E' }}
          >
            <CheckCircle2 size={16} strokeWidth={1.75} className="text-warning shrink-0" />
            {total} pending booking{total !== 1 ? 's' : ''} require your action.
          </div>
        )}

        {/* ── List ── */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-0">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)}
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              variant="generic"
              title="No pending approvals"
              hint="All booking requests have been reviewed. Check back later."
            />
          ) : (
            <ul className="divide-y divide-neutral-50">
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
  booking:  Booking;
  onView:   () => void;
  onApprove: () => void;
  onReject:  () => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const busy = approving || rejecting;

  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-4">
        {/* Pending dot */}
        <div className="mt-1.5 w-2 h-2 rounded-full bg-warning shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-normal text-neutral-900 truncate">{b.title}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {MEETING_TYPE_LABEL[b.meetingType] ?? b.meetingType}
              </p>
            </div>
            <button
              onClick={onView}
              className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-700 font-normal transition-colors shrink-0"
            >
              View <ChevronRight size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Building2 size={12} strokeWidth={1.75} className="text-neutral-300" />
              {b.room.name}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={12} strokeWidth={1.75} className="text-neutral-300" />
              {fmtDate(b.startTime)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} strokeWidth={1.75} className="text-neutral-300" />
              {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} strokeWidth={1.75} className="text-neutral-300" />
              {b.attendeeCount}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} strokeWidth={1.75} className="text-neutral-300" />
              {b.createdBy.name}
              {b.department && <span className="text-neutral-400"> · {b.department.name}</span>}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
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

export default ApprovalsPage;
