import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Download, CalendarDays, TrendingUp, Users,
  Building2, MapPin, Store, RefreshCw,
} from 'lucide-react';
import { reportService, type BookingReport, type SiteVisitReport, type FairReport } from '../services/reportService';
import { AppShell }   from '../components/layout/AppShell';
import { Header }     from '../components/layout/Header';
import { Button }     from '../components/ui/Button';
import { SkeletonTable } from '../components/ui/Skeleton';
import { EmptyState }  from '../components/ui/EmptyState';

// ── Constants ──────────────────────────────────────────────────────────────────

const GOLD  = '#C9A97A';
const CHART_COLORS = ['#C9A97A', '#4ade80', '#60a5fa', '#a78bfa', '#f59e0b', '#f87171'];

const INTEREST_COLORS: Record<string, string> = {
  hot:  '#f87171',
  warm: '#f59e0b',
  cold: '#60a5fa',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function defaultRange() {
  const end   = new Date();
  const start = new Date(end.getTime() - 30 * 86400000);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate:   end.toISOString().slice(0, 10),
  };
}

const PRESET_RANGES = [
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year',    days: 365 },
];

// ── Shared sub-components ──────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: {
  label: string; value: string | number; sub?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[11px] uppercase tracking-widest font-medium" style={{ color: 'rgba(201,169,122,0.55)' }}>{label}</p>
        {icon && <span className="text-white/20">{icon}</span>}
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-white/35">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(201,169,122,0.55)' }}>
      {children}
    </h3>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-sm font-medium text-white/70 mb-4">{title}</p>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 px-3 py-2 text-xs shadow-xl" style={{ background: '#1A1614' }}>
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

// ── Date range picker ──────────────────────────────────────────────────────────

interface DateRangePickerProps {
  startDate: string;
  endDate:   string;
  onChange:  (start: string, end: string) => void;
}

function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const setPreset = (days: number) => {
    const end   = new Date();
    const start = new Date(end.getTime() - days * 86400000);
    onChange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {PRESET_RANGES.map(p => (
        <button
          key={p.label}
          onClick={() => setPreset(p.days)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-auto">
        <input type="date" value={startDate}
          onChange={e => onChange(e.target.value, endDate)}
          className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
        />
        <span className="text-white/30 text-xs">to</span>
        <input type="date" value={endDate}
          onChange={e => onChange(startDate, e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#C9A97A]/40"
        />
      </div>
    </div>
  );
}

// ── Bookings Report Tab ────────────────────────────────────────────────────────

function BookingsTab({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data, isLoading } = useQuery<BookingReport>({
    queryKey: ['report-bookings', startDate, endDate],
    queryFn:  () => reportService.getBookingReport({ startDate, endDate }),
  });

  if (isLoading) return <SkeletonTable rows={6} />;
  if (!data) return <EmptyState title="No booking data" hint="No bookings found in this date range" />;

  const { summary, byMeetingType, byRoom, byDepartment, dailyTrend } = data;

  const pieData = [
    { name: 'Internal', value: byMeetingType.internal },
    { name: 'External', value: byMeetingType.external },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Bookings"  value={summary.total}     icon={<CalendarDays size={14} />} />
        <StatCard label="Confirmed"       value={summary.confirmed} sub="approved + in-progress" />
        <StatCard label="Pending"         value={summary.pending}   sub="awaiting approval" />
        <StatCard label="Cancelled"       value={summary.cancelled} />
        <StatCard label="Total Hours"     value={summary.totalHours + 'h'} sub="meeting time used" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Daily Booking Trend">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Bookings" fill={GOLD} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="By Meeting Type">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" nameKey="name">
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* By room table */}
      <div>
        <SectionTitle>Utilisation by Room</SectionTitle>
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Room', 'Location', 'Floor', 'Bookings', 'Hours Used', 'Cancelled'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {byRoom.slice(0, 10).map(r => (
                <tr key={r.roomId} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{r.roomName}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{r.location}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{r.floor}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-[#C9A97A]/60"
                          style={{ width: `${Math.min(100, (r.bookings / (byRoom[0]?.bookings || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-white font-medium">{r.bookings}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{r.hours}h</td>
                  <td className="px-4 py-3 text-white/40">{r.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By department */}
      {byDepartment.length > 0 && (
        <div>
          <SectionTitle>By Department</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byDepartment.slice(0, 6).map((d, i) => (
              <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-white/70">{d.name}</p>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{d.bookings}</p>
                  <p className="text-xs text-white/35">{d.hours}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Site Visits Report Tab ─────────────────────────────────────────────────────

function SiteVisitsTab({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data, isLoading } = useQuery<SiteVisitReport>({
    queryKey: ['report-site-visits', startDate, endDate],
    queryFn:  () => reportService.getSiteVisitReport({ startDate, endDate }),
  });

  if (isLoading) return <SkeletonTable rows={6} />;
  if (!data) return <EmptyState title="No site visit data" hint="No site visits found in this date range" />;

  const { summary, byClientType, bySalesRep, bySite, bySource, weeklyTrend } = data;

  const clientTypePie = [
    { name: 'New',      value: byClientType.newClients },
    { name: 'Existing', value: byClientType.existingClients },
    { name: 'Referral', value: byClientType.referrals },
  ].filter(d => d.value > 0);

  const sourcePie = bySource.slice(0, 5).map((s, i) => ({ name: s.source, value: s.count, fill: CHART_COLORS[i] }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <StatCard label="Total Visits"     value={summary.total}     icon={<MapPin size={14} />} />
        <StatCard label="Completed"        value={summary.completed} />
        <StatCard label="Scheduled"        value={summary.scheduled} />
        <StatCard label="Cancelled"        value={summary.cancelled} />
        <StatCard label="No Show"          value={summary.noShow} />
        <StatCard label="Conversion Rate"  value={summary.conversionRate} sub="completed / total" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Weekly Visit Trend">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Visits" fill="#60a5fa" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="By Client Type">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={clientTypePie} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" nameKey="name">
                {clientTypePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Sales rep leaderboard */}
      <div>
        <SectionTitle>Sales Rep Performance</SectionTitle>
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Rep', 'Role', 'Total', 'Completed', 'No Show', 'Conversion'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {bySalesRep.map((r, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{r.role.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-white">{r.total}</td>
                  <td className="px-4 py-3 text-emerald-400">{r.completed}</td>
                  <td className="px-4 py-3 text-red-400/70">{r.noShow}</td>
                  <td className="px-4 py-3">
                    <span className="text-[#C9A97A] font-medium">{r.conversionRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By site + By source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <SectionTitle>By Project Site</SectionTitle>
          <div className="space-y-2">
            {bySite.slice(0, 6).map((s, i) => (
              <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">{s.name}</p>
                  <p className="text-xs text-white/35">{s.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{s.total} visits</p>
                  <p className="text-xs text-emerald-400/70">{s.completed} completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>By Lead Source</SectionTitle>
          <div className="space-y-2">
            {sourcePie.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.fill }} />
                <span className="text-sm text-white/60 flex-1">{s.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      background: s.fill,
                      width: `${(s.value / (sourcePie[0]?.value || 1)) * 100}%`,
                    }} />
                  </div>
                  <span className="text-sm text-white/70 w-6 text-right">{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fairs Report Tab ───────────────────────────────────────────────────────────

function FairsTab({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data, isLoading } = useQuery<FairReport>({
    queryKey: ['report-fairs', startDate, endDate],
    queryFn:  () => reportService.getFairReport({ startDate, endDate }),
  });

  if (isLoading) return <SkeletonTable rows={6} />;
  if (!data) return <EmptyState title="No fair data" hint="No fairs found in this date range" />;

  const { summary, byInterestLevel, byLeadStatus, fairs } = data;

  const interestPie = [
    { name: 'Hot',  value: byInterestLevel.hot,  fill: '#f87171' },
    { name: 'Warm', value: byInterestLevel.warm, fill: '#f59e0b' },
    { name: 'Cold', value: byInterestLevel.cold, fill: '#60a5fa' },
  ].filter(d => d.value > 0);

  const statusBars = Object.entries(byLeadStatus)
    .map(([status, count]) => ({ status: status.replace('_', ' '), count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Fairs"     value={summary.totalFairs}     icon={<Store size={14} />} />
        <StatCard label="Total Visitors"  value={summary.totalVisitors} />
        <StatCard label="Leads Captured"  value={summary.totalLeads} />
        <StatCard label="Converted"       value={summary.totalConverted} sub="sales made" />
        <StatCard label="Lead Conv. Rate" value={summary.overallConvRate} sub="visitors → leads" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard title="Lead Pipeline Status">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusBars} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis type="category" dataKey="status" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Leads" fill={GOLD} radius={[0,3,3,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="By Interest Level">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={interestPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" nameKey="name">
                {interestPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Fair-by-fair table */}
      {fairs.length > 0 && (
        <div>
          <SectionTitle>Per Fair Breakdown</SectionTitle>
          <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Fair', 'City', 'Visitors', 'Checked In', 'Leads', '🔥 Hot', '🌡 Warm', '❄ Cold', 'Converted', 'Conv. Rate'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-white/30 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {fairs.map(f => (
                  <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-3">
                      <p className="font-medium text-white text-xs">{f.name}</p>
                      <p className="text-[10px] text-white/35">{fmtDate(f.startDate)}</p>
                    </td>
                    <td className="px-3 py-3 text-white/50 text-xs">{f.city}</td>
                    <td className="px-3 py-3 text-white text-xs">{f.visitors}{f.targetVisitors ? <span className="text-white/30">/{f.targetVisitors}</span> : ''}</td>
                    <td className="px-3 py-3 text-white/60 text-xs">{f.checkedIn}</td>
                    <td className="px-3 py-3 text-[#C9A97A] font-medium text-xs">{f.leads}</td>
                    <td className="px-3 py-3 text-red-400 text-xs">{f.hot}</td>
                    <td className="px-3 py-3 text-amber-400 text-xs">{f.warm}</td>
                    <td className="px-3 py-3 text-blue-400 text-xs">{f.cold}</td>
                    <td className="px-3 py-3 text-emerald-400 text-xs">{f.converted}</td>
                    <td className="px-3 py-3 text-xs">
                      <span className="text-[#C9A97A] font-medium">{f.conversionRate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

type ReportTab = 'bookings' | 'site-visits' | 'fairs';

const TABS: { key: ReportTab; label: string; icon: React.ReactNode }[] = [
  { key: 'bookings',    label: 'Bookings',    icon: <Building2 size={13} /> },
  { key: 'site-visits', label: 'Site Visits', icon: <MapPin    size={13} /> },
  { key: 'fairs',       label: 'Fairs',       icon: <Store     size={13} /> },
];

export function ReportsPage() {
  const [tab, setTab]         = useState<ReportTab>('bookings');
  const { startDate: defStart, endDate: defEnd } = defaultRange();
  const [startDate, setStart] = useState(defStart);
  const [endDate, setEnd]     = useState(defEnd);

  const handleRange = (s: string, e: string) => { setStart(s); setEnd(e); };

  const exportUrl = useMemo(() => {
    const map: Record<ReportTab, 'bookings' | 'site-visits' | 'fairs'> = {
      'bookings':    'bookings',
      'site-visits': 'site-visits',
      'fairs':       'fairs',
    };
    return reportService.exportUrl(map[tab], { startDate, endDate });
  }, [tab, startDate, endDate]);

  return (
    <AppShell>
      <Header
        title="Reports"
        action={
          <a href={exportUrl} download>
            <Button variant="outline" size="sm" icon={<Download size={13} />}>
              Export CSV
            </Button>
          </a>
        }
      />

      <div className="p-6">
        {/* Date range */}
        <div className="mb-5">
          <DateRangePicker startDate={startDate} endDate={endDate} onChange={handleRange} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <span className={tab === t.key ? 'text-[#C9A97A]' : 'text-white/30'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Period label */}
        <p className="text-xs text-white/30 mb-5">
          Showing data from <span className="text-white/50">{fmtDate(startDate)}</span> to <span className="text-white/50">{fmtDate(endDate)}</span>
        </p>

        {/* Tab content */}
        {tab === 'bookings'    && <BookingsTab    startDate={startDate} endDate={endDate} />}
        {tab === 'site-visits' && <SiteVisitsTab  startDate={startDate} endDate={endDate} />}
        {tab === 'fairs'       && <FairsTab       startDate={startDate} endDate={endDate} />}
      </div>
    </AppShell>
  );
}

export default ReportsPage;
