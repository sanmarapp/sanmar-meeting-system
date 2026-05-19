import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Search, Users, MapPin,
  Wifi, Tv, Coffee, Mic, X,
} from 'lucide-react';
import { roomService, type Room, type RoomType } from '../services/roomService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/cn';

// ─── Config ────────────────────────────────────────────────────
const ROOM_TYPES: { value: RoomType | 'ALL'; label: string }[] = [
  { value: 'ALL',             label: 'All Types'       },
  { value: 'MEETING_ROOM',    label: 'Meeting Room'    },
  { value: 'BOARDROOM',       label: 'Boardroom'       },
  { value: 'CONFERENCE_HALL', label: 'Conference Hall' },
  { value: 'TRAINING_ROOM',   label: 'Training Room'   },
  { value: 'HOT_DESK',        label: 'Hot Desk'        },
];

const ROOM_TYPE_LABEL: Record<string, string> = {
  MEETING_ROOM:    'Meeting Room',
  BOARDROOM:       'Boardroom',
  CONFERENCE_HALL: 'Conference Hall',
  TRAINING_ROOM:   'Training Room',
  HOT_DESK:        'Hot Desk',
};

const ROOM_TYPE_ACCENT: Record<string, string> = {
  MEETING_ROOM:    '#826B52',
  BOARDROOM:       '#3B82F6',
  CONFERENCE_HALL: '#F59E0B',
  TRAINING_ROOM:   '#22C55E',
  HOT_DESK:        '#9CA3AF',
};

const ROOM_TYPE_VARIANT: Record<string, 'brand' | 'info' | 'warning' | 'success' | 'neutral'> = {
  MEETING_ROOM:    'brand',
  BOARDROOM:       'info',
  CONFERENCE_HALL: 'warning',
  TRAINING_ROOM:   'success',
  HOT_DESK:        'neutral',
};

// ─── Amenity icon ──────────────────────────────────────────────
function AmenityIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes('wifi') || n.includes('internet'))                         return <Wifi   size={11} strokeWidth={1.75} />;
  if (n.includes('tv') || n.includes('display') || n.includes('projector')) return <Tv     size={11} strokeWidth={1.75} />;
  if (n.includes('coffee') || n.includes('tea'))                            return <Coffee size={11} strokeWidth={1.75} />;
  if (n.includes('mic') || n.includes('audio'))                             return <Mic    size={11} strokeWidth={1.75} />;
  return null;
}

// ─── Component ─────────────────────────────────────────────────
export function RoomsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin  = ['ADMIN', 'SUPER_ADMIN', 'CORPORATE_ADMIN'].includes(user?.role ?? '');

  const [typeFilter, setTypeFilter] = useState<RoomType | 'ALL'>('ALL');
  const [search, setSearch]         = useState('');

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn:  () => roomService.list(),
  });

  const filtered = useMemo(() => {
    return (rooms as Room[]).filter(r => {
      const matchType   = typeFilter === 'ALL' || r.type === typeFilter;
      const matchSearch = !search.trim()
        || r.name.toLowerCase().includes(search.toLowerCase())
        || r.location?.name?.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch && r.isActive;
    });
  }, [rooms, typeFilter, search]);

  const hasFilters = typeFilter !== 'ALL' || !!search;
  const clearAll   = () => { setSearch(''); setTypeFilter('ALL'); };

  return (
    <AppShell>
      <Header
        title="Rooms"
        subtitle={isLoading
          ? 'Loading…'
          : `${filtered.length} room${filtered.length !== 1 ? 's' : ''} available`}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={13} strokeWidth={2.5} />}
            onClick={() => navigate('/bookings/new')}
          >
            Book a Room
          </Button>
        }
      />

      <div className="flex-1 px-5 py-5 space-y-5 animate-fade-in">

        {/* ── Filter bar ── */}
        <div className="bg-white border border-neutral-150 rounded-xl shadow-xs">
          {/* Type tabs */}
          <div
            className="flex items-center gap-0.5 px-3 pt-2 pb-0 overflow-x-auto scrollbar-hidden"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {ROOM_TYPES.map(({ value, label }) => {
              const active = typeFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setTypeFilter(value as RoomType | 'ALL')}
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

          {/* Search */}
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex-1">
              <Input
                placeholder="Search by room name or location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                prefix={<Search size={14} strokeWidth={1.75} />}
                fullWidth
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 whitespace-nowrap transition-colors shrink-0"
              >
                <X size={12} strokeWidth={2} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Room grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[220px] rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            variant="rooms"
            title={hasFilters ? 'No rooms match your filters' : undefined}
            action={hasFilters
              ? { label: 'Clear filters', onClick: clearAll }
              : { label: 'Book a Room',   onClick: () => navigate('/bookings/new') }
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((room: Room) => (
              <RoomCard
                key={room.id}
                room={room}
                onView={() => navigate(`/rooms/${room.id}`)}
                onBook={() => navigate(`/bookings/new?roomId=${room.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ─── Room card ─────────────────────────────────────────────────
function RoomCard({ room, onBook, onView }: { room: Room; onBook: () => void; onView: () => void }) {
  const accent = ROOM_TYPE_ACCENT[room.type] ?? '#826B52';

  return (
    <div className="group bg-white border border-neutral-150 rounded-xl shadow-xs overflow-hidden flex flex-col transition-all duration-150 hover:shadow-sm hover:-translate-y-px">
      {/* Accent strip */}
      <div className="h-[3px] w-full shrink-0" style={{ background: accent }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-normal text-neutral-900 truncate leading-snug">
              {room.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-400">
              <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
              <span className="truncate">{room.location?.name ?? '—'}</span>
              {room.floor && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span>Floor {room.floor}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={ROOM_TYPE_VARIANT[room.type] ?? 'neutral'} dot={false} size="sm">
            {ROOM_TYPE_LABEL[room.type] ?? room.type}
          </Badge>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1.5 text-sm text-neutral-600 mb-3">
          <Users size={13} strokeWidth={1.75} className="text-neutral-400 shrink-0" />
          <span>{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
            {room.amenities.slice(0, 5).map(a => (
              <span
                key={a}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-75 text-neutral-600 border border-neutral-150"
              >
                <AmenityIcon name={a} />
                {a}
              </span>
            ))}
            {room.amenities.length > 5 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-75 text-neutral-400 border border-neutral-150">
                +{room.amenities.length - 5} more
              </span>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onView} className="flex-1 text-xs">
            Details
          </Button>
          <Button variant="outline" size="sm" onClick={onBook} className="flex-1 text-xs">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RoomsPage;
