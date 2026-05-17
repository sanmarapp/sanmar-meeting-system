import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Building2, CalendarDays, Clock, Users,
  ChevronDown, Info, CheckCircle2,
} from 'lucide-react';
import { roomService, type Room } from '../services/roomService';
import { bookingService, type MeetingType } from '../services/bookingService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardHeader, CardDivider } from '../components/ui/Card';

// ─── Config ────────────────────────────────────────────────────
const MEETING_TYPES: { value: MeetingType; label: string; hint: string }[] = [
  { value: 'INTERNAL',  label: 'Internal',  hint: 'Team meetings, syncs, reviews' },
  { value: 'CLIENT',    label: 'Client',    hint: 'External clients or partners' },
  { value: 'BOARD',     label: 'Board',     hint: 'Executive and board sessions' },
  { value: 'TRAINING',  label: 'Training',  hint: 'Workshops and learning sessions' },
  { value: 'OTHER',     label: 'Other',     hint: 'Any other meeting type' },
];

const ARRANGEMENT_TYPES = [
  { value: '',              label: 'Standard (default)' },
  { value: 'BOARDROOM',     label: 'Boardroom style' },
  { value: 'CLASSROOM',     label: 'Classroom / Theatre' },
  { value: 'U_SHAPE',       label: 'U-Shape' },
  { value: 'HOLLOW_SQUARE', label: 'Hollow Square' },
  { value: 'COCKTAIL',      label: 'Cocktail / Standing' },
];

const ROOM_TYPE_LABEL: Record<string, string> = {
  MEETING_ROOM:    'Meeting Room',
  BOARDROOM:       'Boardroom',
  CONFERENCE_HALL: 'Conference Hall',
  TRAINING_ROOM:   'Training Room',
  HOT_DESK:        'Hot Desk',
};

// ─── Helpers ───────────────────────────────────────────────────
function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function durationLabel(startTime: string, endTime: string): string {
  const s = new Date(`2000-01-01T${startTime}:00`);
  const e = new Date(`2000-01-01T${endTime}:00`);
  const mins = (e.getTime() - s.getTime()) / 60000;
  if (mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Field style (reusable native select / input class) ─────────
const fieldCls =
  'w-full h-9 px-3 text-base font-sans bg-white text-neutral-900 ' +
  'border border-neutral-200 rounded-md transition-all duration-150 ' +
  'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ' +
  'placeholder:text-neutral-400 appearance-none';

// ─── Component ─────────────────────────────────────────────────
export function NewBookingPage() {
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────
  const [title, setTitle]                     = useState('');
  const [meetingType, setMeetingType]         = useState<MeetingType>('INTERNAL');
  const [description, setDescription]         = useState('');
  const [roomId, setRoomId]                   = useState('');
  const [date, setDate]                       = useState(todayStr());
  const [startTime, setStartTime]             = useState('09:00');
  const [endTime, setEndTime]                 = useState('10:00');
  const [attendeeCount, setAttendeeCount]     = useState<number | ''>(1);
  const [arrangement, setArrangement]         = useState('');
  const [requiresRefresh, setRequiresRefresh] = useState(false);
  const [notes, setNotes]                     = useState('');
  const [errors, setErrors]                   = useState<Record<string, string>>({});

  // ── Room list ──────────────────────────────────────────────
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn:  () => roomService.list({ available: true }),
  });

  const selectedRoom = rooms.find((r: Room) => r.id === roomId) ?? null;

  // ── Derived ────────────────────────────────────────────────
  const duration = useMemo(
    () => (startTime && endTime ? durationLabel(startTime, endTime) : '—'),
    [startTime, endTime],
  );

  const timeValid = useMemo(() => {
    if (!startTime || !endTime) return false;
    return endTime > startTime;
  }, [startTime, endTime]);

  // ── Validation ─────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim())        e.title        = 'Meeting title is required.';
    if (!roomId)              e.roomId       = 'Please select a room.';
    if (!date)                e.date         = 'Please choose a date.';
    if (!startTime)           e.startTime    = 'Start time is required.';
    if (!endTime)             e.endTime      = 'End time is required.';
    if (!timeValid)           e.endTime      = 'End time must be after start time.';
    if (!attendeeCount || attendeeCount < 1) e.attendeeCount = 'At least 1 attendee required.';
    if (selectedRoom && attendeeCount && attendeeCount > selectedRoom.capacity) {
      e.attendeeCount = `Room capacity is ${selectedRoom.capacity}.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Mutation ───────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      bookingService.create({
        title:               title.trim(),
        description:         description.trim() || undefined,
        roomId,
        startTime:           toIso(date, startTime),
        endTime:             toIso(date, endTime),
        attendeeCount:       Number(attendeeCount),
        meetingType,
        arrangementType:     arrangement || undefined,
        requiresRefreshment: requiresRefresh || undefined,
        notes:               notes.trim() || undefined,
      }),
    onSuccess: (booking) => {
      toast.success('Booking submitted', {
        description: 'Your meeting request is pending approval.',
      });
      navigate(`/bookings/${booking.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      toast.error('Booking failed', { description: Array.isArray(msg) ? msg[0] : msg });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) mutate();
  }

  return (
    <AppShell>
      <Header
        title="New Booking"
        subtitle="Schedule a meeting room"
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={13} strokeWidth={2} />}
            onClick={() => navigate('/bookings')}
          >
            Back
          </Button>
        }
      />

      <div className="flex-1 p-6 animate-fade-in">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 max-w-5xl">

            {/* ── Left col: form ─── */}
            <div className="space-y-5">

              {/* Section 1 — Meeting details */}
              <Card>
                <CardHeader title="Meeting Details" subtitle="What's this meeting about?" />

                {/* Title */}
                <div className="space-y-4">
                  <Input
                    label="Meeting Title"
                    placeholder="e.g. Q3 Strategy Review"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }}
                    error={errors.title}
                    required
                    fullWidth
                  />

                  {/* Meeting type */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700">Meeting Type</label>
                    <div className="relative">
                      <select
                        value={meetingType}
                        onChange={e => setMeetingType(e.target.value as MeetingType)}
                        className={fieldCls + ' pr-8 cursor-pointer'}
                      >
                        {MEETING_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label} — {t.hint}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} strokeWidth={1.75} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Description */}
                  <Textarea
                    label="Description"
                    placeholder="Agenda, purpose, or any relevant context…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    hint="Optional — helps approvers understand the purpose."
                  />
                </div>
              </Card>

              {/* Section 2 — Room & time */}
              <Card>
                <CardHeader title="Room &amp; Schedule" subtitle="Choose your room and set the time" />

                <div className="space-y-4">
                  {/* Room picker */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700">
                      Room <span className="text-danger ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={roomId}
                        onChange={e => { setRoomId(e.target.value); setErrors(prev => ({ ...prev, roomId: '' })); }}
                        className={fieldCls + ' pr-8 cursor-pointer' + (errors.roomId ? ' border-danger/70' : '')}
                        disabled={roomsLoading}
                      >
                        <option value="">
                          {roomsLoading ? 'Loading rooms…' : 'Select a room'}
                        </option>
                        {rooms.map((r: Room) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {ROOM_TYPE_LABEL[r.type] ?? r.type} · {r.capacity} seats
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} strokeWidth={1.75} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    {errors.roomId && (
                      <p className="text-xs text-danger">{errors.roomId}</p>
                    )}
                    {/* Room info pill */}
                    {selectedRoom && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        <Building2 size={12} strokeWidth={1.75} className="text-neutral-400" />
                        <span>{selectedRoom.location.name}</span>
                        {selectedRoom.floor && <><span>·</span><span>Floor {selectedRoom.floor}</span></>}
                        <span>·</span>
                        <span>Capacity {selectedRoom.capacity}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <Input
                    label="Date"
                    type="date"
                    value={date}
                    min={todayStr()}
                    onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })); }}
                    error={errors.date}
                    required
                    fullWidth
                    prefix={<CalendarDays size={14} strokeWidth={1.75} />}
                  />

                  {/* Start / end time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-neutral-700">
                        Start Time <span className="text-danger ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <Clock size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="time"
                          value={startTime}
                          onChange={e => { setStartTime(e.target.value); setErrors(prev => ({ ...prev, startTime: '', endTime: '' })); }}
                          className={fieldCls + ' pl-9' + (errors.startTime ? ' border-danger/70' : '')}
                          required
                        />
                      </div>
                      {errors.startTime && <p className="text-xs text-danger">{errors.startTime}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-neutral-700">
                        End Time <span className="text-danger ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <Clock size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="time"
                          value={endTime}
                          onChange={e => { setEndTime(e.target.value); setErrors(prev => ({ ...prev, endTime: '' })); }}
                          className={fieldCls + ' pl-9' + (errors.endTime ? ' border-danger/70' : '')}
                          required
                        />
                      </div>
                      {errors.endTime && <p className="text-xs text-danger">{errors.endTime}</p>}
                    </div>
                  </div>

                  {/* Duration feedback */}
                  {startTime && endTime && (
                    <div className={`flex items-center gap-1.5 text-xs ${timeValid ? 'text-neutral-500' : 'text-danger'}`}>
                      <Info size={12} strokeWidth={1.75} />
                      {timeValid ? `Duration: ${duration}` : 'End time must be after start time'}
                    </div>
                  )}
                </div>
              </Card>

              {/* Section 3 — Attendees & options */}
              <Card>
                <CardHeader title="Attendees &amp; Setup" subtitle="How many people, and how should the room be arranged?" />

                <div className="space-y-4">
                  {/* Attendee count */}
                  <Input
                    label="Number of Attendees"
                    type="number"
                    min={1}
                    max={selectedRoom?.capacity ?? 999}
                    value={attendeeCount}
                    onChange={e => {
                      setAttendeeCount(e.target.value === '' ? '' : Number(e.target.value));
                      setErrors(prev => ({ ...prev, attendeeCount: '' }));
                    }}
                    error={errors.attendeeCount}
                    hint={selectedRoom ? `Room capacity: ${selectedRoom.capacity} seats` : undefined}
                    prefix={<Users size={14} strokeWidth={1.75} />}
                    required
                    fullWidth
                  />

                  {/* Arrangement */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700">Room Arrangement</label>
                    <div className="relative">
                      <select
                        value={arrangement}
                        onChange={e => setArrangement(e.target.value)}
                        className={fieldCls + ' pr-8 cursor-pointer'}
                      >
                        {ARRANGEMENT_TYPES.map(a => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} strokeWidth={1.75} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Refreshments toggle */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={requiresRefresh}
                        onChange={e => setRequiresRefresh(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor:     requiresRefresh ? '#826B52' : '#D4CBC0',
                          backgroundColor: requiresRefresh ? '#826B52' : 'white',
                        }}
                      >
                        {requiresRefresh && (
                          <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700">Request refreshments</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Tea, coffee, or water will be arranged by the facility team.</p>
                    </div>
                  </label>

                  <CardDivider />

                  {/* Notes */}
                  <Textarea
                    label="Additional Notes"
                    placeholder="Any special requirements, AV needs, or instructions for the facility team…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    hint="Optional — visible to the approver and facility team."
                  />
                </div>
              </Card>
            </div>

            {/* ── Right col: summary ─── */}
            <div className="space-y-4">

              {/* Booking summary */}
              <Card className="sticky top-[70px]">
                <CardHeader title="Summary" />

                <dl className="space-y-3">
                  <SummaryRow
                    icon={<Building2 size={14} strokeWidth={1.75} />}
                    label="Room"
                    value={selectedRoom ? selectedRoom.name : <span className="text-neutral-300 italic">Not selected</span>}
                  />
                  <SummaryRow
                    icon={<CalendarDays size={14} strokeWidth={1.75} />}
                    label="Date"
                    value={date
                      ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
                      : <span className="text-neutral-300 italic">Not set</span>}
                  />
                  <SummaryRow
                    icon={<Clock size={14} strokeWidth={1.75} />}
                    label="Time"
                    value={startTime && endTime
                      ? `${startTime} – ${endTime}`
                      : <span className="text-neutral-300 italic">Not set</span>}
                  />
                  {timeValid && (
                    <div className="pl-[22px]">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(130,107,82,0.08)', color: '#826B52' }}
                      >
                        <Clock size={10} strokeWidth={2} /> {duration}
                      </span>
                    </div>
                  )}
                  <SummaryRow
                    icon={<Users size={14} strokeWidth={1.75} />}
                    label="Attendees"
                    value={attendeeCount || <span className="text-neutral-300 italic">Not set</span>}
                  />
                </dl>

                <CardDivider />

                {/* Amenities */}
                {selectedRoom?.amenities && selectedRoom.amenities.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Room Amenities</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {selectedRoom.amenities.map(a => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {a}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Approval notice */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <Info size={13} strokeWidth={1.75} className="text-neutral-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Bookings are subject to manager approval. You'll be notified once confirmed.
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={isPending}
                    type="submit"
                  >
                    Submit Booking Request
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    fullWidth
                    type="button"
                    onClick={() => navigate('/bookings')}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>

          </div>
        </form>
      </div>
    </AppShell>
  );
}

// ─── Summary row ───────────────────────────────────────────────
function SummaryRow({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-neutral-300 shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <dt className="text-xs text-neutral-400 mb-0.5">{label}</dt>
        <dd className="text-sm font-medium text-neutral-800">{value}</dd>
      </div>
    </div>
  );
}

export default NewBookingPage;
