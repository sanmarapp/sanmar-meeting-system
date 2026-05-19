import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Clock, User, Database, Shield, X,
} from 'lucide-react';
import { auditService, type AuditLog } from '../services/auditService';
import { AppShell }   from '../components/layout/AppShell';
import { Header }     from '../components/layout/Header';
import { Button }     from '../components/ui/Button';
import { Input }      from '../components/ui/Input';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState }  from '../components/ui/EmptyState';
import { cn } from '../lib/cn';

// ─── Helpers ───────────────────────────────────────────────────
function fmtTs(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// Action badge style
const ACTION_STYLE: Record<string, { bg: string; text: string }> = {
  CREATED:    { bg: 'bg-success-50',   text: 'text-success-600'   },
  APPROVED:   { bg: 'bg-info-50',      text: 'text-info-600'      },
  REJECTED:   { bg: 'bg-danger-50',    text: 'text-danger-500'    },
  CANCELLED:  { bg: 'bg-danger-50',    text: 'text-danger-500'    },
  UPDATED:    { bg: 'bg-warning-50',   text: 'text-warning-600'   },
  DELETED:    { bg: 'bg-danger-50',    text: 'text-danger-500'    },
  LOGIN:      { bg: 'bg-neutral-100',  text: 'text-neutral-600'   },
  COMPLETED:  { bg: 'bg-success-50',   text: 'text-success-600'   },
  CHECKED_IN: { bg: 'bg-info-50',      text: 'text-info-600'      },
};

function getActionStyle(action: string) {
  const key = Object.keys(ACTION_STYLE).find(k => action.includes(k));
  return key ? ACTION_STYLE[key] : { bg: 'bg-neutral-100', text: 'text-neutral-500' };
}

// ─── Changes diff ──────────────────────────────────────────────
function ChangesDiff({ changes }: { changes: Record<string, any> }) {
  const keys = Object.keys(changes ?? {});
  if (keys.length === 0) return <span className="text-neutral-300 text-xs">—</span>;

  return (
    <div className="space-y-0.5 text-xs max-w-xs">
      {keys.slice(0, 3).map(k => (
        <div key={k} className="flex items-baseline gap-1.5">
          <span className="text-neutral-400 font-mono shrink-0">{k}:</span>
          <span className="text-neutral-600 truncate">
            {typeof changes[k] === 'object'
              ? JSON.stringify(changes[k]).slice(0, 50)
              : String(changes[k]).slice(0, 50)}
          </span>
        </div>
      ))}
      {keys.length > 3 && <div className="text-neutral-400">+{keys.length - 3} more</div>}
    </div>
  );
}

// ─── Expanded detail row ───────────────────────────────────────
function ExpandedRow({ log }: { log: AuditLog }) {
  return (
    <tr>
      <td colSpan={6} className="px-5 pb-3 pt-0">
        <div className="rounded-lg border border-neutral-150 bg-neutral-25 p-3 font-mono text-xs text-neutral-700 overflow-auto max-h-48">
          <pre className="whitespace-pre-wrap">{JSON.stringify(log.changes, null, 2)}</pre>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-neutral-400">
          <span>Log ID: <span className="text-neutral-600 font-mono">{log.id}</span></span>
          <span>Entity ID: <span className="text-neutral-600 font-mono">{log.entityId}</span></span>
          {log.ipAddress && <span>IP: <span className="text-neutral-600 font-mono">{log.ipAddress}</span></span>}
        </div>
      </td>
    </tr>
  );
}

// ─── Component ─────────────────────────────────────────────────
const PAGE_SIZE = 50;

export function AuditLogPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [entityFilter, setEntity] = useState('');
  const [actionFilter, setAction] = useState('');
  const [startDate, setStart]     = useState('');
  const [endDate, setEnd]         = useState('');
  const [expandedId, setExpanded] = useState<string | null>(null);

  const params = useMemo(() => ({
    page, limit: PAGE_SIZE,
    ...(entityFilter && { entity: entityFilter }),
    ...(actionFilter && { action: actionFilter }),
    ...(startDate    && { startDate }),
    ...(endDate      && { endDate }),
  }), [page, entityFilter, actionFilter, startDate, endDate]);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn:  () => auditService.list(params),
    placeholderData: (prev: any) => prev,
  });

  const { data: entityTypes = [] } = useQuery({
    queryKey: ['audit-entity-types'],
    queryFn:  () => auditService.getEntityTypes(),
  });

  const { data: actionTypes = [] } = useQuery({
    queryKey: ['audit-action-types'],
    queryFn:  () => auditService.getActionTypes(),
  });

  const logs  = data?.data  ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter((l: AuditLog) =>
      l.userId?.toLowerCase().includes(q) ||
      l.entity?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.entityId?.toLowerCase().includes(q),
    );
  }, [logs, search]);

  const resetFilters = () => {
    setEntity(''); setAction(''); setStart(''); setEnd(''); setPage(1); setSearch('');
  };

  const hasFilters = !!(entityFilter || actionFilter || startDate || endDate || search);

  const selectClass = 'px-3 h-[38px] text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[rgba(130,107,82,0.12)] focus:border-neutral-300 transition-shadow';

  return (
    <AppShell>
      <Header
        title="Audit Log"
        subtitle={isLoading ? 'Loading…' : `${total.toLocaleString()} entries`}
      />

      <div className="flex-1 px-5 py-5 space-y-4 animate-fade-in">

        {/* ── Filter bar ── */}
        <div className="bg-white border border-neutral-150 rounded-xl shadow-xs p-3">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search user, entity, action…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                prefix={<Search size={14} strokeWidth={1.75} />}
                fullWidth
              />
            </div>

            {/* Entity filter */}
            <select
              value={entityFilter}
              onChange={e => { setEntity(e.target.value); setPage(1); }}
              className={selectClass}
            >
              <option value="">All Entities</option>
              {(entityTypes as string[]).map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            {/* Action filter */}
            <select
              value={actionFilter}
              onChange={e => { setAction(e.target.value); setPage(1); }}
              className={selectClass}
            >
              <option value="">All Actions</option>
              {(actionTypes as string[]).map(a => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={e => { setStart(e.target.value); setPage(1); }}
                className={selectClass}
              />
              <span className="text-xs text-neutral-400">–</span>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEnd(e.target.value); setPage(1); }}
                className={selectClass}
              />
            </div>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 whitespace-nowrap transition-colors"
              >
                <X size={12} strokeWidth={2} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-neutral-150 rounded-xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={10} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No audit entries found"
              hint={hasFilters
                ? 'Try adjusting your filters'
                : 'Audit entries will appear here as actions are taken.'}
              action={hasFilters ? { label: 'Clear filters', onClick: resetFilters } : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="s-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Changes</th>
                      <th className="w-8" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log: AuditLog) => {
                      const isExpanded = expandedId === log.id;
                      const aStyle = getActionStyle(log.action);

                      return (
                        <>
                          <tr
                            key={log.id}
                            className="group cursor-pointer"
                            onClick={() => setExpanded(isExpanded ? null : log.id)}
                          >
                            {/* Timestamp */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                                <Clock size={11} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
                                {fmtTs(log.timestamp)}
                              </div>
                            </td>

                            {/* User */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-mono">
                                <User size={11} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
                                <span className="truncate max-w-[120px]">{log.userId}</span>
                              </div>
                            </td>

                            {/* Action */}
                            <td className="px-4 py-3.5">
                              <span className={cn(
                                'inline-block px-2 py-0.5 rounded-full text-[11px] font-normal',
                                aStyle.bg, aStyle.text,
                              )}>
                                {log.action.replace(/_/g, ' ')}
                              </span>
                            </td>

                            {/* Entity */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 text-neutral-700 text-xs">
                                <Database size={11} strokeWidth={1.75} className="text-neutral-300 shrink-0" />
                                {log.entity}
                              </div>
                            </td>

                            {/* Changes */}
                            <td className="px-4 py-3.5">
                              <ChangesDiff changes={log.changes} />
                            </td>

                            {/* Expand */}
                            <td className="px-3 py-3.5 text-neutral-300">
                              {isExpanded
                                ? <ChevronUp size={14} strokeWidth={1.75} />
                                : <ChevronDown size={14} strokeWidth={1.75} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              }
                            </td>
                          </tr>

                          {isExpanded && <ExpandedRow key={`${log.id}-exp`} log={log} />}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-25">
                  <p className="text-xs text-neutral-400 tabular-nums">
                    Page {page} of {pages} · {total.toLocaleString()} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="xs"
                      icon={<ChevronLeft size={12} strokeWidth={2} />}
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Prev
                    </Button>
                    <span className="text-xs text-neutral-400 tabular-nums min-w-[52px] text-center">
                      {page} / {pages}
                    </span>
                    <Button
                      variant="outline" size="xs"
                      iconRight={<ChevronRight size={12} strokeWidth={2} />}
                      disabled={page === pages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default AuditLogPage;
