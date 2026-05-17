import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService, type Booking } from '../services/bookingService';
import { siteVisitService, type SiteVisit } from '../services/siteVisitService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, StatCard } from '../components/ui/Card';
import { Badge, bookingStatusVariant, bookingStatusLabel, visitStatusVariant } from '../components/ui/Badge';
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

// ─── Component ─────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  // Queries
  const { data: todayBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['bookings', 'today', today],
    queryFn:  () => bookingService.list({ date: today, limit: 5 }),
  });

  const { data: pendingBookings, isLoading: loadingPending } = useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn:  () => bookingService.list({ status: 'PENDING', limit: 5 }),
  });

  const { data: recentVisits, isLoading: loadingVisits } = useQuery({
    queryKey: ['site-visits', 'recent'],
    queryFn:  () => siteVisitService.list({ limit: 5 }),
  });

  const todayCount   = todayBookings?.total   ?? 0;
  const pendingCount = pendingBookings?.total  ?? 0;
  const visitCount   = recentVisits?.length    ?? 0;

  const greeting = DASHBOARD.greeting(user?.name?.split(' ')[0] ?? 'there');

  return (
    <AppShell>
      <Header
        title={DASHBOARD.todayMeetings.replace("Today's", 'Dashboard')}
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

      <div className="flex-1 p-6 space-y-6 animate-fade-in">

        {/* ── Stat row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {loadingBookings ? (
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            <>
              <StatCard
                label={DASHBOARD.todayMeetings}
                value={todayCount}
                delta={todayCount > 0 ? `${todayCount} meeting${todayCount > 1 ? 's' : ''} today` : 'No meetings today'}
                deltaType={todayCount > 0 ? 'up' : 'neutral'}
              />
              <StatCard
                label={DASHBOARD.pendingApproval}
                value={pendingCount}
                delta={pendingCount > 0 ? 'Requires your action' : 'All caught up'}
                deltaType={pendingCount > 0 ? 'warn' : 'up'}
              />
              <StatCard
                label={DASHBOARD.siteVisitsWeek}
                value={visitCount}
                delta={visitCount > 0 ? `${visitCount} visit${visitCount > 1 ? 's' : ''} scheduled` : 'No visits this week'}
                deltaType={visitCount > 0 ? 'up' : 'neutral'}
              />
              <StatCard
                label="Your Role"
                value={user?.role ?? '—'}
                delta={user?.department?.name ?? user?.designation ?? ''}
                deltaType="neutral"
              />
            </>
          )}
        </div>

        {/* ── Content row ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Upcoming bookings */}
          <Card>
            <CardHeader
              title="Upcoming Bookings"
              subtitle="Today and next 7 days"
              action={
                <button
                  onClick={() => navigate('/bookings')}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  View all →
                </button>
              }
            />
            {loadingBookings ? (
              <div className="space-y-0">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonListItem key={i} />)}
              </div>
            ) : !todayBookings?.data.length ? (
              <EmptyState
                variant="bookings"
                action={{ label: 'Schedule a Meeting', onClick: () => navigate('/bookings/new') }}
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {todayBookings.data.map((b: Booking) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-neutral-50 -mx-1 px-1 rounded-lg transition-colors"
                    onClick={() => navigate(`/bookings/${b.id}`)}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{b.title}</p>
                      <p className="text-xs text-neutral-500">
                        {b.room.name} · {formatTime(b.startTime)}–{formatTime(b.endTime)}
                      </p>
                    </div>
                    <Badge variant={bookingStatusVariant(b.status)}>
                      {bookingStatusLabel(b.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Site visits */}
          <Card>
            <CardHeader
              title="Site Visits"
              subtitle="Recent and upcoming"
              action={
                <button
                  onClick={() => navigate('/site-visits')}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  View all →
                </button>
              }
            />
            {loadingVisits ? (
              <div>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonListItem key={i} />)}
              </div>
            ) : !recentVisits?.length ? (
              <EmptyState
                variant="visits"
                action={{ label: 'Schedule a Visit', onClick: () => navigate('/site-visits/new') }}
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recentVisits.map((v: SiteVisit) => (
                  <li
                    key={v.id}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-neutral-50 -mx-1 px-1 rounded-lg transition-colors"
                    onClick={() => navigate(`/site-visits/${v.id}`)}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-info-DEFAULT shrink-0" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{v.client.name}</p>
                      <p className="text-xs text-neutral-500">
                        {v.site.name} · {formatDate(v.visitDate)}
                      </p>
                    </div>
                    <Badge variant={visitStatusVariant(v.status)}>
                      {v.status.charAt(0) + v.status.slice(1).toLowerCase().replace('_', ' ')}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ── Pending approvals banner (admin/manager only) ── */}
        {pendingCount > 0 && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <div className="bg-warning-light border border-warning-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays size={18} strokeWidth={1.75} className="text-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold text-neutral-800">
                  {pendingCount} booking{pendingCount > 1 ? 's' : ''} awaiting your approval
                </p>
                <p className="text-xs text-neutral-500">Review and confirm or reject pending requests.</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/approvals')}
            >
              Review Now
            </Button>
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default DashboardPage;
