import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, CalendarDays, Users, ChevronRight,
  ChevronLeft, Building2, X,
} from 'lucide-react';
import { bookingService, type Booking, type BookingStatus } from '../services/bookingService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, bookingStatusVariant, bookingStatusLabel } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/cn';

// ─── Config ────────────────────────────────────────────────────
type FilterStatus = BookingStatus | 'ALL';

const STATUS_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Pending',   value: 'PENDING'   },
  { label: 'Approved',  value: 'APPROVED'  },
  { label: 'Rejected',  value: 'REJECTED'  },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Completed', value: 'COMPLETED' },
];

const MEETING_TYPE_LABEL: Record<string, string> = {
  INTERNAL: 'Internal',
  CLIENT:   'Client',
  BOARD:    'Board',
  TRAINING: 'Training',
  OTHER:    'Other',
};

const PAGE_SIZE = 15;

// ─── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Component ─────────────────────────────────────────────────
export function BookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');
  const [date, setDate]     = useState('');
  const [page, setPage]     = useState(1);

  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'CORPORATE_ADMIN', 'DEPT_MANAGER'].includes(user?.role ?? '');

  const resetPage = useCallback(() => setPage(1), []);

  const handleStatus = useCallback((s: FilterStatus) => {
    setStatusFilter(s);
    setPage(1);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setDate('');
    setPage(1);
  }, []);

  const queryParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    ...(statusFilter !== 'ALL' && { status: statusFilter as BookingStatus }),
    ...(search.trim()          && { search: search.trim() }),
    ...(date                   && { date }),
  }), [statusFilter, search, date, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['bookings', queryParams],
    queryFn:  () => bookingService.list(queryParams),
    placeholderData: (prev: any) => prev,
  });

  const bookings    = data?.data   ?? [];
  const total       = data?.total  ?? 0;
  const totalPages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNext     = page < totalPages;
  const hasPrev     = page > 1;
  const hasFilters  = !!(search || date);

  const subtitle = isLoading
    ? 'Loading…'
    : total > 0
      ? `${total} booking${total !== 1 ? 's' : ''}`
      : 'No bookings found';

  return (
    <AppShell>
      <Header
        title="Bookings"
        subtitle={subtitle}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={13} strokeWidth={2.5} />}
            onClick={() => navigate('/bookings/new')}
          >
            New Booking
          </Button>
        }
      />

      <div className="flex-1 px-5 py-5 space-y-4 animate-fade-in">

        {/* ── Filter bar ── */}
        <div className="bg-white border border-neutral-150 rounded-xl shadow-xs">

          {/* Status tabs */}
          <div
            className="flex items-center gap-0.5 px-3 pt-2 pb-0 overflow-x-auto scrollbar-hidden"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {STATUS_TABS.map(({ label, value }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => handleStatus(value)}
                  className={cn(
                    'relative shrink-0 px-3 py-2 text-sm font-normal transition-colors duration-100 select-none',
                    'rounded-t-lg border-b-2 -mb-px',
                    active
                      ? 'text-[#826B52] border-[#C9A97A]'
                      : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-200',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search + date row */}
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex-1">
              <Input
                placeholder="Search by title, room or requester…"
                value={search}
                onChange={handleSearch}
                prefix={<Search size={14} strokeWidth={1.75} />}
                fullWidth
              />
            </div>
            <div className="w-44 shrink-0">
              <Input
                type="date"
                value={date}
                onChange={handleDate}
                fullWidth
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 whitespace-nowrap transition-colors shrink-0"
              >
                <X size={12} strokeWidth={2} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div
          className="bg-white border border-neutral-150 rounded-xl shadow-xs overflow-hidden"
          style={{ opacity: isFetching && !isLoading ? 0.75 : 1, transition: 'opacity 150ms' }}
        >
          <div className="overflow-x-auto">
            <table className="s-table">
              <thead>
                <tr>
                  <th className="w-[280px]">Meeting</th>
                  <th>Room</th>
                  <th>Date &amp; Time</th>
                  <th>
                    <Users size={12} strokeWidth={2} className="text-neutral-300" aria-label="Attendees" />
                  </th>
                  {isAdmin && <th>Requested By</th>}
                  <th>Status</th>
                  <th className="w-8" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonTable rows={8} />
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-20">
                      <EmptyState
                        variant="bookings"
                        title={hasFilters ? 'No bookings match your filters' : undefined}
                        hint={hasFilters ? 'Try adjusting your search or date filter.' : undefined}
                        action={
                          hasFilters
                            ? { label: 'Clear filters', onClick: clearFilters }
                            : { label: 'New Booking',  onClick: () => navigate('/bookings/new') }
                        }
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  bookings.map((b: Booking) => (
                    <BookingTableRow
                      key={b.id}
                      booking={b}
                      isAdmin={isAdmin}
                      onClick={() => navigate(`/bookings/${b.id}`)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-25">
              <p className="text-xs text-neutral-400 tabular-nums">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  icon={<ChevronLeft size={12} strokeWidth={2} />}
                  disabled={!hasPrev || isFetching}
                  onClick={() => setPage(p => p - 1)}
                >
                  Prev
                </Button>
                <span className="text-xs text-neutral-400 tabular-nums min-w-[52px] text-center">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  iconRight={<ChevronRight size={12} strokeWidth={2} />}
                  disabled={!hasNext || isFetching}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}

// ─── Table row ─────────────────────────────────────────────────
function BookingTableRow({
  booking: b,
  isAdmin,
  onClick,
}: {
  booking:  Booking;
  isAdmin:  boolean;
  onClick:  () => void;
}) {
  return (
    <tr className="cursor-pointer" onClick={onClick}>
      {/* Title + type */}
      <td className="px-5 py-3.5">
        <p className="font-normal text-neutral-900 truncate max-w-[240px]">{b.title}</p>
        <p className="text-xs text-neutral-400 mt-0.5">
          {MEETING_TYPE_LABEL[b.meetingType] ?? b.meetingType}
        </p>
      </td>

      {/* Room */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <Building2 size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span className="truncate max-w-[130px]">{b.room.name}</span>
        </div>
        {b.room.location && (
          <p className="text-xs text-neutral-400 mt-0.5 pl-[21px] truncate max-w-[130px]">
            {b.room.location.name}
          </p>
        )}
      </td>

      {/* Date + time */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <CalendarDays size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span>{fmtDate(b.startTime)}</span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5 pl-[21px]">
          {fmtTime(b.startTime)}–{fmtTime(b.endTime)}
        </p>
      </td>

      {/* Attendees */}
      <td className="px-4 py-3.5">
        <span className="text-neutral-600 tabular-nums">{b.attendeeCount}</span>
      </td>

      {/* Requested by */}
      {isAdmin && (
        <td className="px-4 py-3.5">
          <p className="text-neutral-700 truncate max-w-[130px]">{b.createdBy.name}</p>
          {b.department && (
            <p className="text-xs text-neutral-400 mt-0.5 truncate">{b.department.name}</p>
          )}
        </td>
      )}

      {/* Status */}
      <td className="px-4 py-3.5">
        <Badge variant={bookingStatusVariant(b.status)}>
          {bookingStatusLabel(b.status)}
        </Badge>
      </td>

      {/* Chevron */}
      <td className="px-3 py-3.5">
        <ChevronRight size={14} strokeWidth={1.75} className="text-neutral-300" />
      </td>
    </tr>
  );
}

export default BookingsPage;
