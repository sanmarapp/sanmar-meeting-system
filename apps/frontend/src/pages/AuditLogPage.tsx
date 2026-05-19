import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Shield, Clock, User, Database,
} from 'lucide-react';
import { auditService, type AuditLog } from '../services/auditService';
import { AppShell }   from '../components/layout/AppShell';
import { Header }     from '../components/layout/Header';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState }  from '../components/ui/EmptyState';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtTs(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// Action colour coding
const ACTION_STYLE: Record<string, string> = {
  CREATED:    'bg-emerald-500/15 text-emerald-400',
  APPROVED:   'bg-blue-500/15    text-blue-400',
  REJECTED:   'bg-red-500/15     text-red-400',
  CANCELLED:  'bg-red-500/15     text-red-400',
  UPDATED:    'bg-amber-500/15   text-amber-400',
  DELETED:    'bg-red-500/15     text-red-400',
  LOGIN:      'bg-violet-500/15  text-violet-400',
  COMPLETED:  'bg-emerald-500/15 text-emerald-400',
  CHECKED_IN: 'bg-blue-500/15    text-blue-400',
};

function actionStyle(action: string): string {
  const key = Object.keys(ACTION_STYLE).find(k => action.includes(k));
  return key ? ACTION_STYLE[key] : 'bg-white/10 text-white/50';
}

// ── Changes diff viewer ────────────────────────────────────────────────────────

function ChangesDiff({ changes }: { changes: Record<string, any> }) {
  const keys = Object.keys(changes);
  if (keys.length === 0) return <span className="text-white/25 text-xs">—</span>;

  return (
    <div className="space-y-0.5 text-xs max-w-xs">
      {keys.slice(0, 4).map(k => (
        <div key={k} className="flex items-baseline gap-1.5">
          <span className="text-white/30 font-mono shrink-0">{k}:</span>
          <span className="text-white/60 truncate">
            {typeof changes[k] === 'object'
              ? JSON.stringify(changes[k]).slice(0, 60)
              : String(changes[k]).slice(0, 60)}
          </span>
        </div>
      ))}
      {keys.length > 4 && (
        <div className="text-white/25">+{keys.length - 4} more</div>
      )}
    </div>
  );
}

// ── Expanded row detail ────────────────────────────────────────────────────────

function ExpandedRow({ log }: { log: AuditLog }) {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="rounded-lg border border-white/[0.08] p-3 font-mono text-xs text-white/60 overflow-auto max-h-48">
          <pre>{JSON.stringify(log.changes, null, 2)}</pre>
        </div>
        <div className="flex gap-6 mt-2 text-xs text-white/30">
          <span>Log ID: <span className="text-white/50">{log.id}</span></span>
          <span>Entity ID: <span className="text-white/50">{log.entityId}</span></span>
          {log.ipAddress && <span>IP: <span className="text-white/50">{log.ipAddress}</span></span>}
        </div>
      </td>
    </tr>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

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

  // Client-side search on userId/entity/action
  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(l =>
      l.userId.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.entityId.toLowerCase().includes(q),
    );
  }, [logs, search]);

  const resetFilters = () => {
    setEntity(''); setAction(''); setStart(''); setEnd(''); setPage(1); setSearch('');
  };

  const hasFilters = entityFilter || actionFilter || startDate || endDate || search;

  return (
    <AppShell>
      <Header title="Audit Log" />
      <div className="p-6">

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search user, entity, action…"
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40 w-64"
            />
          </div>

          {/* Entity filter */}
          <select
            value={entityFilter}
            onChange={e => { setEntity(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
          >
            <option value="">All Entities</option>
            {entityTypes.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={e => { setAction(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
          >
            <option value="">All Actions</option>
            {actionTypes.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date" value={startDate}
              onChange={e => { setStart(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
            />
            <span className="text-white/30 text-xs">to</span>
            <input
              type="date" value={endDate}
              onChange={e => { setEnd(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
            />
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="text-xs text-white/40 hover:text-white/70 transition-colors px-2">
              Clear filters
            </button>
          )}

          <div className="ml-auto text-xs text-white/30">
            {total.toLocaleString()} entries
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <SkeletonTable rows={10} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No audit entries found"
            description={hasFilters ? 'Try adjusting your filters' : 'Audit entries will appear here as actions are taken in the system'}
          />
        ) : (
          <>
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Timestamp', 'User', 'Action', 'Entity', 'Changes', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(log => (
                    <>
                      <tr
                        key={log.id}
                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setExpanded(expandedId === log.id ? null : log.id)}
                      >
                        <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-white/25" />
                            {fmtTs(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/60 text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <User size={11} className="text-white/25" />
                            <span className="truncate max-w-[120px]">{log.userId}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${actionStyle(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Database size={11} className="text-white/25" />
                            <span className="text-white/70 text-xs">{log.entity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ChangesDiff changes={log.changes} />
                        </td>
                        <td className="px-4 py-3 text-white/30">
                          {expandedId === log.id
                            ? <ChevronUp size={14} />
                            : <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </td>
                      </tr>
                      {expandedId === log.id && <ExpandedRow key={`${log.id}-exp`} log={log} />}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-white/30">
                  Page {page} of {pages} · {total.toLocaleString()} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          pg === page
                            ? 'bg-[#C9A97A]/20 text-[#C9A97A] border border-[#C9A97A]/30'
                            : 'text-white/40 hover:text-white/70 border border-white/10'
                        }`}
                      >{pg}</button>
                    );
                  })}
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

export default AuditLogPage;
