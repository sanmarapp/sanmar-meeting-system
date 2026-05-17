import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Users, MapPin, Building2, Wifi, Tv,
  Coffee, Mic, ChevronLeft, ChevronRight, CalendarDays,
  Clock, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import { roomService, type Room } from '../services/roomService';
import { AppShell }   from '../components/layout/AppShell';
import { Header }     from '../components/layout/Header';
import { Button }     from '../components/ui/Button';
import { Badge }      from '../components/ui/Badge';
import { Card, CardHeader } from '../components/ui/Card';
import { Skeleton }   from '../components/ui/Skeleton';

// ─── Config ────────────────────────────────────────────────────
const ROOM_TYPE_LABEL: Record<string, string> = {
  MEETING_ROOM:    'Meeting Room',
  BOARDROOM:       'Boardroom',
  CONFERENCE_HALL: 'Conference Hall',
  TRAINING_ROOM:   'Training Room',
  HOT_DESK:        'Hot Desk',
};

const ROOM_TYPE_VARIANT: Record<string, 'brand' | 'info' | 'warning' | 'success' | 'neutral'> = {
  MEETING_ROOM:    'brand',
  BOARDROOM:       'info',
  CONFERENCE_HALL: 'warning',
  TRAINING_ROOM:   'success',
  HOT_DESK:        'neutral',
};

const TYPE_ACCENT: Record<string, string> = {
  MEETING_ROOM:    '#826B52',
  BOARDROOM:       '#3B82F6',
  CONFERENCE_HALL: '#F59E0B',
  TRAINING_ROOM:   '#22C55E',
  HOT_DESK:        '#9CA3AF',
};

// ─── Helpers ───────────────────────────────────────────────────
function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function fmtMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function isToday(year: number, month: number, day: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

function isPast(year: number, month: number, day: number): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(year, month, day) < today;
}

function AmenityIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('wifi') || n.includes('internet')) return <Wifi size={12} strokeWidth={1.75} />;
  if (n.includes('tv') || n.includes('display') || n.includes('screen') || n.includes('projector')) return <Tv size={12} strokeWidth={1.75} />;
  if (n.includes('coffee') || n.includes('tea') || n.includes('refreshment')) return <Coffee size={12} strokeWidth={1.75} />;
  if (n.includes('mic') || n.includes('audio') || n.includes('sound')) return <Mic size={12} strokeWidth={1.75} />;
  return null;
}

// ─── Calendar component ────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MonthCalendar({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (dateStr: string) => void;
}) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = useMemo(() => {
    const firstDay    = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Prevent navigating before current month
  const today0 = new Date(); today0.setDate(1); today0.setHours(0, 0, 0, 0);
  const viewDate = new Date(viewYear, viewMonth, 1);
  const canGoPrev = viewDate > today0;

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-sm font-semibold text-neutral-800">
          {fmtMonthYear(viewYear, viewMonth)}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-neutral-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr  = toISODate(viewYear, viewMonth, day);
          const past     = isPast(viewYear, viewMonth, day);
          const todayDay = isToday(viewYear, viewMonth, day);
          const active   = selected === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => !past && onSelect(dateStr)}
              disabled={past}
              className={[
                'relative mx-auto flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all duration-100',
                past    ? 'text-neutral-300 cursor-not-allowed'      : 'cursor-pointer',
                active  ? 'text-white font-semibold'                 : '',
                !active && !past && todayDay ? 'font-semibold'       : '',
                !active && !past ? 'hover:bg-neutral-100 text-neutral-800' : '',
              ].join(' ')}
              style={active ? { background: '#826B52' } : undefined}
              aria-label={dateStr}
              aria-pressed={active}
            >
              {todayDay && !active && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#826B52' }}
                />
              )}
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Availability slots panel ──────────────────────────────────
function AvailabilityPanel({
  roomId,
  selectedDate,
  onBook,
}: {
  roomId: string;
  selectedDate: string;
  onBook: (date: string, start: string) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['room-availability', roomId, selectedDate],
    queryFn:  () => roomService.checkAvailability(roomId, selectedDate),
    enabled:  !!selectedDate,
    staleTime: 60_000,
  });

  const fmtSelectedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={14} strokeWidth={1.75} className="text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-800">{fmtSelectedDate}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-sm text-danger p-3 bg-danger/5 rounded-lg border border-danger/20">
          <AlertCircle size={14} />
          <span>Could not load availability. The API may not support this endpoint yet.</span>
        </div>
      ) : !data?.slots?.length ? (
        <div className="text-sm text-neutral-400 text-center py-6">
          No time slots defined for this date.
        </div>
      ) : (
        <div className="space-y-2">
          {data.slots.map((slot, i) => (
            <div
              key={i}
              className={[
                'flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors',
                slot.available
                  ? 'border-neutral-200 bg-white hover:border-brand/40'
                  : 'border-neutral-100 bg-neutral-50',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 text-sm">
                <Clock size={13} strokeWidth={1.75} className="text-neutral-400 shrink-0" />
                <span className={slot.available ? 'text-neutral-800' : 'text-neutral-400'}>
                  {fmtTime(slot.start)} – {fmtTime(slot.end)}
                </span>
              </div>
              {slot.available ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 size={12} /> Available
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onBook(selectedDate, slot.start)}
                  >
                    Book
                  </Button>
                </div>
              ) : (
                <span className="flex items-center gap-1 text-xs text-neutral-400">
                  <XCircle size={12} /> Booked
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────
export function RoomDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  const today     = new Date();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    toISODate(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const { data: room, isLoading, isError } = useQuery<Room>({
    queryKey: ['room', id],
    queryFn:  () => roomService.getById(id!),
    enabled:  !!id,
  });

  function handleBook(date: string, start: string) {
    const params = new URLSearchParams({ roomId: id!, date, startTime: start });
    navigate(`/bookings/new?${params.toString()}`);
  }

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <AppShell>
        <Header title="Room Detail" backHref="/rooms" />
        <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-5">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Not found ──
  if (isError || !room) {
    return (
      <AppShell>
        <Header title="Room Detail" backHref="/rooms" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <Building2 size={40} className="mx-auto text-neutral-300" />
            <p className="text-neutral-500 font-medium">Room not found</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/rooms')}>
              Back to Rooms
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const accent = TYPE_ACCENT[room.type] ?? '#826B52';

  return (
    <AppShell>
      <Header
        title={room.name}
        subtitle={ROOM_TYPE_LABEL[room.type] ?? room.type}
        backHref="/rooms"
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/bookings/new?roomId=${room.id}`)}
          >
            Book this Room
          </Button>
        }
      />

      <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5 animate-fade-in">

        {/* ── Hero card ── */}
        <Card padding="none">
          {/* Accent strip */}
          <div className="h-1.5 w-full rounded-t-xl" style={{ background: accent }} />

          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

              {/* Left: core info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="font-display text-xl font-bold text-neutral-900 truncate">
                    {room.name}
                  </h1>
                  {!room.isActive && (
                    <Badge variant="neutral">Inactive</Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} strokeWidth={1.75} className="text-neutral-400" />
                    {room.location?.name ?? '—'}
                  </span>
                  {room.floor && (
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} strokeWidth={1.75} className="text-neutral-400" />
                      Floor {room.floor}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users size={13} strokeWidth={1.75} className="text-neutral-400" />
                    {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                  </span>
                </div>
              </div>

              {/* Right: type badge */}
              <Badge variant={ROOM_TYPE_VARIANT[room.type] ?? 'neutral'} dot={false}>
                {ROOM_TYPE_LABEL[room.type] ?? room.type}
              </Badge>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2.5">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map(a => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200"
                    >
                      <AmenityIcon name={a} />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Calendar + Availability ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Calendar */}
          <Card padding="none">
            <div className="p-5">
              <CardHeader title="Check Availability" />
              <MonthCalendar
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
              {selectedDate && (
                <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-400 text-center">
                  Select a date to see available time slots →
                </div>
              )}
            </div>
          </Card>

          {/* Slots */}
          <Card padding="none">
            <div className="p-5">
              <CardHeader title="Time Slots" />
              {selectedDate ? (
                <AvailabilityPanel
                  roomId={room.id}
                  selectedDate={selectedDate}
                  onBook={handleBook}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-400 text-sm space-y-2">
                  <CalendarDays size={28} strokeWidth={1.25} />
                  <span>Select a date to see availability</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Quick book CTA ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border"
          style={{ background: 'rgba(130,107,82,0.05)', borderColor: 'rgba(130,107,82,0.2)' }}
        >
          <div>
            <p className="font-semibold text-neutral-900 text-sm">Ready to book {room.name}?</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Your booking will be sent for approval once submitted.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams({ roomId: room.id });
              if (selectedDate) params.set('date', selectedDate);
              navigate(`/bookings/new?${params.toString()}`);
            }}
          >
            Book this Room
          </Button>
        </div>

      </div>
    </AppShell>
  );
}

export default RoomDetailPage;
