import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, CalendarDays, MapPin, ChevronRight,
  ChevronLeft, User, X, SlidersHorizontal,
} from 'lucide-react';
import { siteVisitService, type SiteVisit, type VisitStatus } from '../services/siteVisitService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { visitStatusVariant } from '../components/ui/Badge';

// ─── Config ────────────────────────────────────────────────────
type FilterStatus = VisitStatus | 'ALL';

const STATUS_TABS: { label: string; value: FilterStatus }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'No Show',   value: 'NO_SHOW' },
];

const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  SCHEDULED:   'Scheduled',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
  NO_SHOW:     'No Show',
  RESCHEDULED: 'Rescheduled',
};

const PAGE_SIZE = 15;

// ─── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtTime(timeStr: string) {
  // visitTime may be "HH:MM" or ISO
  if (timeStr.includes('T')) {
    return new Date(timeStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr.slice(0, 5);
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

  // Note: siteVisitService.list returns array — we handle pagination client-side
  const { data: allVisits = [], isLoading, isFetching } = useQuery({
    queryKey: ['site-visits', queryParams],
    queryFn:  () => siteVisitService.list(queryParams),
    placeholderData: (prev: any) => prev,
  });

  const visits     = allVisits;
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

      <div className="flex-1 p-6 space-y-4 animate-fade-in">

        {/* ── Filters ── */}
        <div className="bg-white border border-neutral-200 rounded-xl px-4 pt-3 pb-4 shadow-xs space-y-3">
          {/* Status tabs */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {STATUS_TABS.map(({ label, value }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => handleStatus(value)}
                  className="text-sm px-3 py-1.5 rounded-lg font-normal transition-all duration-100 select-none"
                  style={{
                    background: active ? 'rgba(130,107,82,0.1)' : 'transparent',
                    color: active ? '#826B52' : 'rgba(0,0,0,0.5)',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-1 text-xs text-neutral-400">
              <SlidersHorizontal size={12} strokeWidth={1.75} />
              <span>Filters</span>
            </div>
          </div>

          {/* Search + date */}
          <div className="flex items-center gap-3">
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
              <Input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }} fullWidth />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 whitespace-nowrap transition-colors">
                <X size={12} strokeWidth={2} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div
          className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden"
          style={{ opacity: isFetching && !isLoading ? 0.7 : 1, transition: 'opacity 150ms' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EDE9' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Site</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider whitespace-nowrap">Date &amp; Time</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Booked By</th>
                  <th className="px-4 py-3 text-left text-[11px] font-normal text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 w-8" aria-hidden />
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
                            ? { label: 'Clear filters', onClick: clearFilters }
                            : { label: 'Schedule Visit', onClick: () => navigate('/site-visits/new') }
                        }
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  visits.map((v: SiteVisit) => (
                    <VisitRow key={v.id} visit={v} onClick={() => navigate(`/site-visits/${v.id}`)} />
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

// ─── Visit row ─────────────────────────────────────────────────
function VisitRow({ visit: v, onClick }: { visit: SiteVisit; onClick: () => void }) {
  return (
    <tr
      className="cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid #F5F3F0' }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FAFAF9')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      onClick={onClick}
    >
      {/* Client */}
      <td className="px-5 py-3.5">
        <p className="font-normal text-neutral-900">{v.client.name}</p>
        {v.client.phone && <p className="text-xs text-neutral-400 mt-0.5">{v.client.phone}</p>}
      </td>

      {/* Site */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <MapPin size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span className="truncate max-w-[140px]">{v.site.name}</span>
        </div>
        {v.site.address && (
          <p className="text-xs text-neutral-400 mt-0.5 pl-[21px] truncate max-w-[140px]">{v.site.address}</p>
        )}
      </td>

      {/* Date + time */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <CalendarDays size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span>{fmtDate(v.visitDate)}</span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5 pl-[21px]">{fmtTime(v.visitTime)}</p>
      </td>

      {/* Booked by */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-neutral-700">
          <User size={13} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
          <span className="truncate max-w-[120px]">{v.bookedBy.name}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <Badge variant={visitStatusVariant(v.status)}>
          {VISIT_STATUS_LABEL[v.status] ?? v.status}
        </Badge>
      </td>

      {/* Arrow */}
      <td className="px-3 py-3.5">
        <ChevronRight size={15} strokeWidth={1.75} className="text-neutral-300" />
      </td>
    </tr>
  );
}

export default SiteVisitsPage;
