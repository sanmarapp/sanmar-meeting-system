import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, CalendarDays, MapPin, ChevronRight,
  ChevronLeft, User, X,
} from 'lucide-react';
import { siteVisitService, type SiteVisit, type VisitStatus } from '../services/siteVisitService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge, visitStatusVariant, visitStatusLabel } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/cn';

// ─── Config ────────────────────────────────────────────────────
type FilterStatus = VisitStatus | 'ALL';

const STATUS_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All',         value: 'ALL'         },
  { label: 'Scheduled',   value: 'SCHEDULED'   },
  { label: 'Completed',   value: 'COMPLETED'   },
  { label: 'Rescheduled', value: 'RESCHEDULED' },
  { label: 'Cancelled',   value: 'CANCELLED'   },
  { label: 'No Show',     value: 'NO_SHOW'     },
];

const PAGE_SIZE = 15;

// ─── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
function fmtTime(t: string) {
  if (t?.includes('T')) {
    return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return t?.slice(0, 5) ?? '';
}

// ─── Component ─────────────────────────────────────────────────
export function SiteVisitsPage() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');
  const [date, setDate]     = useState('');
  const [page, setPage]     = useState(1);

  const handleStatus = useCallback((s: FilterStatus) => { setStatusFilter(s); setPage(1); }, []);
  const clearFilters = useCallback(() => { setSearch(''); setDate(''); setPage(1); }, []);

  const queryParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    ...(statusFilter !== 'ALL' && { status: statusFilter as VisitStatus }),
    ...(search.trim()          && { search: search.trim() }),
    ...(date                   && { date }),
  }), [statusFilter, search, date, page]);

  const { data: allVisits = [], isLoading, isFetching } = useQuery({
    queryKey: ['site-visits', queryParams],
    queryFn:  () => siteVisitService.list(queryParams),
    placeholderData: (prev: any) => prev,
  });

  const visits     = allVisits as SiteVisit[];
  const total      = visits.length;
  const hasFilters = !!(search || date);

  return (
    <AppShell>
      <Header
        title="Site Visits"
        subtitle={isLoading ? 'Loading…' : `${total} visit${total !== 1 ? 's' : ''}`}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={13} strokeWidth={2.5} />}
            onClick={() => navigate('/site-visits/new')}
          >
            Schedule Visit
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

          {/* Search + date */}
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex-1">
              <Input
                placeholder="Search by client, site or booked by…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                prefix={<Search size={14} strokeWidth={1.75} />}
                fullWidth
              />
            </div>
            <div className="w-44 shrink-0">
              <Input
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setPage(1); }}
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
                  <th>Client</th>
                  <th>Site / Project</th>
                  <th>Date &amp; Time</th>
                  <th>Booked By</th>
                  <th>Status</th>
                  <th className="w-8" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonTable rows={8} />
                ) : visits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20">
                      <EmptyState
                        variant="visits"
                        title={hasFilters ? 'No visits match your filters' : undefined}
                        hint={hasFilters ? 'Try adjusting your search or date filter.' : undefined}
                        action={
                          hasFilters
                            ? { label: 'Clear filters',   onClick: clearFilters }
                            : { label: 'Schedule Visit',  onClick: () => navigate('/site-visits/new') }
                        }
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  visits.map((v) => (
                    <VisitTableRow
                      key={v.id}
                      visit={v}
                      onClick={() => navigate(`/site-visits/${v.id}`)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Visit table row ───────────────────────────────────────────
function VisitTableRow({ visit: v, onClick }: { visit: SiteVisit; onClick: () => void }) {
  return (
    <tr className="cursor-pointer" onClick={onClick}>
      {/* Client */}
      <td className="px-5 py-3.5">
        <p className="font-normal text-neutral-900">{v.client.name}</p>
        {v.client.phone && (
          <p className="text-xs text-neutral-400 mt-0.5">{v.client.phone}</p>
        )}
      </td>

      {/* Site / project */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <MapPin size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span className="truncate max-w-[160px]">
            {v.site?.name ?? '—'}
          </span>
        </div>
        {(v.site?.address) && (
          <p className="text-xs text-neutral-400 mt-0.5 pl-[21px] truncate max-w-[160px]">
            {v.site?.address ?? ''}
          </p>
        )}
      </td>

      {/* Date + time */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <CalendarDays size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span>{fmtDate(v.visitDate)}</span>
        </div>
        {v.visitTime && (
          <p className="text-xs text-neutral-400 mt-0.5 pl-[21px]">{fmtTime(v.visitTime)}</p>
        )}
      </td>

      {/* Booked by */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <User size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span className="truncate max-w-[120px]">{v.bookedBy?.name ?? '—'}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <Badge variant={visitStatusVariant(v.status)}>
          {visitStatusLabel(v.status)}
        </Badge>
      </td>

      {/* Chevron */}
      <td className="px-3 py-3.5">
        <ChevronRight size={14} strokeWidth={1.75} className="text-neutral-300" />
      </td>
    </tr>
  );
}

export default SiteVisitsPage;
