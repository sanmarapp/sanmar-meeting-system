import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Plus, Building2, Clock,
  MapPin, ShieldCheck, ArrowRight, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService, type Booking } from '../services/bookingService';
import { siteVisitService, type SiteVisit } from '../services/siteVisitService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, StatCard } from '../components/ui/Card';
import { Badge, bookingStatusVariant, bookingStatusLabel, visitStatusVariant, visitStatusLabel } from '../components/ui/Badge';
import { SkeletonStat, SkeletonListItem } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { DASHBOARD } from '../lib/copy';

// ─── Helpers ───────────────────────────────────────────────────
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return formatDate(iso);
}

// ─── Sub-components ────────────────────────────────────────────
function BookingRow({ b, onClick }: { b: Booking; onClick: () => void }) {
  return (
    <li
      className="group flex items-center gap-3 py-3 -mx-1 px-1 rounded-lg cursor-pointer transition-colors hover:bg-neutral-50"
      onClick={onClick}
    >
      {/* Time block */}
      <div
        className="shrink-0 w-[52px] text-center px-1.5 py-1 rounded-md"
        style={{ background: 'rgba(130,107,82,0.07)' }}
      >
        <p className="text-[11px] font-normal leading-tight" style={{ color: '#826B52' }}>
          {formatTime(b.startTime)}
        </p>
        <p className="text-[10px] leading-tight" style={{ color: 'rgba(130,107,82,0.55)' }}>
          {formatDateShort(b.startTime)}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-normal text-neutral-900 truncate leading-snug">{b.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Building2 size={10} strokeWidth={2} className="text-neutral-400 shrink-0" />
          <p className="text-xs text-neutral-400 truncate">{b.room.name}</p>
        </div>
      </div>

      {/* Badge + arrow */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={bookingStatusVariant(b.status)} size="sm">
          {bookingStatusLabel(b.status)}
        </Badge>
        <ArrowRight
          size={12}
          strokeWidth={2}
          className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </li>
  );
}

function VisitRow({ v, onClick }: { v: SiteVisit; onClick: () => void }) {
  return (
    <li
      className="group flex items-center gap-3 py-3 -mx-1 px-1 rounded-lg cursor-pointer transition-colors hover:bg-neutral-50"
      onClick={onClick}
    >
      {/* Date block */}
      <div
        className="shrink-0 w-[52px] text-center px-1.5 py-1 rounded-md"
        style={{ background: 'rgba(59,130,246,0.07)' }}
      >
        <p className="text-[11px] font-normal leading-tight text-info-700">
          {new Date(v.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
        <p className="text-[10px] leading-tight text-info-400">
          {new Date(v.visitDate).toLocaleDateString('en-GB', { weekday: 'short' })}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-normal text-neutral-900 truncate leading-snug">{v.client.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={10} strokeWidth={2} className="text-neutral-400 shrink-0" />
          <p className="text-xs text-neutral-400 truncate">{v.site?.name ?? '—'}</p>
        </div>
      </div>

      {/* Badge + arrow */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={visitStatusVariant(v.status)} size="sm">
          {visitStatusLabel(v.status)}
        </Badge>
        <ArrowRight
          size={12}
          strokeWidth={2}
          className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </li>
  );
}

function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => <SkeletonListItem key={i} />)}
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'CORPORATE_ADMIN', 'DEPT_MANAGER'].includes(user?.role ?? '');

  // Queries
  const { data: todayBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['bookings', 'today', today],
    queryFn:  () => bookingService.list({ date: today, limit: 5 }),
  });

  const { data: pendingBookings, isLoading: loadingPending } = useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn:  () => bookingService.list({ status: 'PENDING', limit: 5 }),
    enabled:  isAdmin,
  });

  const { data: recentVisits, isLoading: loadingVisits } = useQuery({
    queryKey: ['site-visits', 'recent'],
    queryFn:  () => siteVisitService.list({ limit: 5 }),
  });

  const todayCount   = todayBookings?.total   ?? 0;
  const pendingCount = pendingBookings?.total  ?? 0;
  const visitCount   = recentVisits?.length   ?? 0;

  const greeting = DASHBOARD.greeting(user?.name?.split(' ')[0] ?? 'there');
  const location = user?.locations?.[0]?.name ?? 'Dhaka HQ';

  return (
    <AppShell>
      <Header
        title="Dashboard"
        subtitle={greeting}
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

      <div className="flex-1 px-5 py-5 space-y-5 animate-fade-in">

        {/* ── Stat row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {loadingBookings ? (
            <>
              <SkeletonStat /> <SkeletonStat />
              <SkeletonStat /> <SkeletonStat />
            </>
          ) : (
            <>
              <StatCard
                label="Today's Meetings"
                value={todayCount}
                delta={todayCount > 0 ? `${todayCount} scheduled` : 'Clear today'}
                deltaType={todayCount > 0 ? 'up' : 'neutral'}
                icon={<CalendarDays size={15} strokeWidth={1.75} />}
                iconColor="bg-primary-50 text-primary-600"
              />
              <StatCard
                label="Pending Approval"
                value={isAdmin ? pendingCount : '—'}
                delta={isAdmin
                  ? (pendingCount > 0 ? 'Needs review' : 'All clear')
                  : 'Admin view only'}
                deltaType={pendingCount > 0 ? 'down' : 'neutral'}
                icon={<Clock size={15} strokeWidth={1.75} />}
                iconColor={pendingCount > 0 ? 'bg-warning-50 text-warning-600' : 'bg-neutral-100 text-neutral-500'}
              />
              <StatCard
                label="Site Visits"
                value={visitCount}
                delta={visitCount > 0 ? `${visitCount} recent` : 'None recent'}
                deltaType={visitCount > 0 ? 'up' : 'neutral'}
                icon={<MapPin size={15} strokeWidth={1.75} />}
                iconColor="bg-info-50 text-info-600"
              />
              <StatCard
                label="Your Location"
                value={location}
                sublabel={user?.department?.name ?? user?.designation ?? user?.role ?? ''}
                icon={<ShieldCheck size={15} strokeWidth={1.75} />}
                iconColor="bg-success-50 text-success-600"
              />
            </>
          )}
        </div>

        {/* ── Pending approvals banner (admin/manager only) ── */}
        {isAdmin && pendingCount > 0 && (
          <div
            className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(217,119,6,0.07) 0%, rgba(217,119,6,0.04) 100%)',
              border: '1px solid rgba(217,119,6,0.18)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center shrink-0">
                <CalendarDays size={15} strokeWidth={1.75} className="text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-normal text-neutral-900">
                  {pendingCount} booking{pendingCount !== 1 ? 's' : ''} awaiting approval
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review and confirm or decline pending requests.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconRight={<ArrowRight size={12} strokeWidth={2} />}
              onClick={() => navigate('/approvals')}
            >
              Review
            </Button>
          </div>
        )}

        {/* ── Content row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Upcoming Bookings */}
          <Card padding="sm">
            <CardHeader
              title="Upcoming Bookings"
              subtitle="Today and next 7 days"
              border
              action={
                <button
                  onClick={() => navigate('/bookings')}
                  className="flex items-center gap-1 text-xs font-normal transition-colors"
                  style={{ color: '#826B52' }}
                >
                  View all
                  <ArrowRight size={11} strokeWidth={2} />
                </button>
              }
            />
            {loadingBookings ? (
              <LoadingRows />
            ) : !todayBookings?.data.length ? (
              <EmptyState
                variant="bookings"
                action={{ label: 'Schedule a Meeting', onClick: () => navigate('/bookings/new') }}
                className="py-8"
              />
            ) : (
              <ul className="divide-y divide-neutral-75">
                {todayBookings.data.map((b: Booking) => (
                  <BookingRow
                    key={b.id}
                    b={b}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                  />
                ))}
              </ul>
            )}
          </Card>

          {/* Site Visits */}
          <Card padding="sm">
            <CardHeader
              title="Site Visits"
              subtitle="Recent and upcoming"
              border
              action={
                <button
                  onClick={() => navigate('/site-visits')}
                  className="flex items-center gap-1 text-xs font-normal transition-colors"
                  style={{ color: '#826B52' }}
                >
                  View all
                  <ArrowRight size={11} strokeWidth={2} />
                </button>
              }
            />
            {loadingVisits ? (
              <LoadingRows />
            ) : !recentVisits?.length ? (
              <EmptyState
                variant="visits"
                action={{ label: 'Schedule a Visit', onClick: () => navigate('/site-visits/new') }}
                className="py-8"
              />
            ) : (
              <ul className="divide-y divide-neutral-75">
                {recentVisits.map((v: SiteVisit) => (
                  <VisitRow
                    key={v.id}
                    v={v}
                    onClick={() => navigate(`/site-visits/${v.id}`)}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ── Quick actions row (admin only) ── */}
        {isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'All Bookings',   icon: CalendarDays, to: '/bookings',    color: 'text-primary-500',  bg: 'bg-primary-50'  },
              { label: 'Approvals',      icon: TrendingUp,   to: '/approvals',   color: 'text-warning-600', bg: 'bg-warning-50'  },
              { label: 'Site Visits',    icon: MapPin,        to: '/site-visits', color: 'text-info-600',    bg: 'bg-info-50'     },
              { label: 'Rooms',          icon: Building2,     to: '/rooms',       color: 'text-success-600', bg: 'bg-success-50'  },
            ].map(({ label, icon: Icon, to, color, bg }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="group flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-neutral-150 bg-white hover:border-neutral-200 hover:shadow-sm transition-all duration-150"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} ${color} transition-transform duration-150 group-hover:-translate-y-px`}>
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-normal text-neutral-600">{label}</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default DashboardPage;
