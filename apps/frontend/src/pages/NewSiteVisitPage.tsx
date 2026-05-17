import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, User, MapPin, CalendarDays, Clock, ChevronDown, Info,
} from 'lucide-react';
import { siteVisitService } from '../services/siteVisitService';
import { clientService, type Client } from '../services/clientService';
import { siteService, type Site } from '../services/siteService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardHeader, CardDivider } from '../components/ui/Card';

// ─── Helpers ───────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0]; }

const fieldCls =
  'w-full h-9 px-3 text-base font-sans bg-white text-neutral-900 ' +
  'border border-neutral-200 rounded-md transition-all duration-150 ' +
  'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ' +
  'placeholder:text-neutral-400 appearance-none';

// ─── Component ─────────────────────────────────────────────────
export function NewSiteVisitPage() {
  const navigate = useNavigate();

  const [clientId, setClientId]   = useState('');
  const [siteId, setSiteId]       = useState('');
  const [date, setDate]           = useState(todayStr());
  const [time, setTime]           = useState('10:00');
  const [notes, setNotes]         = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  // ── Data ───────────────────────────────────────────────────
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn:  () => clientService.list(),
  });

  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn:  () => siteService.list(),
  });

  const selectedClient = (clients as Client[]).find(c => c.id === clientId) ?? null;
  const selectedSite   = (sites as Site[]).find(s => s.id === siteId) ?? null;

  // ── Validation ─────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!clientId) e.clientId = 'Please select a client.';
    if (!siteId)   e.siteId   = 'Please select a site.';
    if (!date)     e.date     = 'Please choose a date.';
    if (!time)     e.time     = 'Please set a visit time.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Mutation ───────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      siteVisitService.create({
        clientId,
        siteId,
        visitDate: date,
        visitTime: time,
        notes: notes.trim() || undefined,
      }),
    onSuccess: (visit) => {
      toast.success('Site visit scheduled', {
        description: `Visit for ${selectedClient?.name ?? 'client'} on ${date} at ${time}.`,
      });
      navigate(`/site-visits/${visit.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      toast.error('Failed to schedule visit', { description: Array.isArray(msg) ? msg[0] : msg });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) mutate();
  }

  return (
    <AppShell>
      <Header
        title="Schedule Site Visit"
        subtitle="Arrange a client property walkthrough"
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={13} strokeWidth={2} />}
            onClick={() => navigate('/site-visits')}
          >
            Back
          </Button>
        }
      />

      <div className="flex-1 p-6 animate-fade-in">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 max-w-4xl">

            {/* ── Left: form ── */}
            <div className="space-y-5">

              {/* Client + Site */}
              <Card>
                <CardHeader title="Visit Details" subtitle="Who is visiting, and which site?" />
                <div className="space-y-4">

                  {/* Client picker */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-normal text-neutral-700">
                      Client <span className="text-danger ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={clientId}
                        onChange={e => { setClientId(e.target.value); setErrors(p => ({ ...p, clientId: '' })); }}
                        className={fieldCls + ' pr-8 cursor-pointer' + (errors.clientId ? ' border-danger/70' : '')}
                        disabled={clientsLoading}
                      >
                        <option value="">{clientsLoading ? 'Loading clients…' : 'Select a client'}</option>
                        {(clients as Client[]).map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}{c.company ? ` — ${c.company}` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} strokeWidth={1.75} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    {errors.clientId && <p className="text-xs text-danger">{errors.clientId}</p>}
                    {selectedClient?.email && (
                      <p className="text-xs text-neutral-400">{selectedClient.email}{selectedClient.phone ? ` · ${selectedClient.phone}` : ''}</p>
                    )}
                  </div>

                  {/* Site picker */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-normal text-neutral-700">
                      Site / Property <span className="text-danger ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={siteId}
                        onChange={e => { setSiteId(e.target.value); setErrors(p => ({ ...p, siteId: '' })); }}
                        className={fieldCls + ' pr-8 cursor-pointer' + (errors.siteId ? ' border-danger/70' : '')}
                        disabled={sitesLoading}
                      >
                        <option value="">{sitesLoading ? 'Loading sites…' : 'Select a property'}</option>
                        {(sites as Site[]).map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}{s.type ? ` — ${s.type}` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} strokeWidth={1.75} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    {errors.siteId && <p className="text-xs text-danger">{errors.siteId}</p>}
                    {selectedSite?.address && (
                      <p className="text-xs text-neutral-400 flex items-center gap-1">
                        <MapPin size={11} strokeWidth={1.75} /> {selectedSite.address}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Date & time */}
              <Card>
                <CardHeader title="Schedule" subtitle="When should the visit take place?" />
                <div className="space-y-4">
                  <Input
                    label="Visit Date"
                    type="date"
                    value={date}
                    min={todayStr()}
                    onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })); }}
                    error={errors.date}
                    prefix={<CalendarDays size={14} strokeWidth={1.75} />}
                    required
                    fullWidth
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-normal text-neutral-700">
                      Visit Time <span className="text-danger ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <Clock size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="time"
                        value={time}
                        onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: '' })); }}
                        className={fieldCls + ' pl-9' + (errors.time ? ' border-danger/70' : '')}
                        required
                      />
                    </div>
                    {errors.time && <p className="text-xs text-danger">{errors.time}</p>}
                  </div>

                  <Textarea
                    label="Notes"
                    placeholder="Any special instructions, access requirements, or context for the visit team…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    hint="Optional — visible to all team members on this visit."
                  />
                </div>
              </Card>
            </div>

            {/* ── Right: summary ── */}
            <div>
              <Card className="sticky top-[70px]">
                <CardHeader title="Summary" />
                <dl className="space-y-3">
                  <SummaryRow icon={<User size={14} strokeWidth={1.75} />} label="Client"
                    value={selectedClient?.name ?? <span className="text-neutral-300 italic">Not selected</span>} />
                  <SummaryRow icon={<MapPin size={14} strokeWidth={1.75} />} label="Site"
                    value={selectedSite?.name ?? <span className="text-neutral-300 italic">Not selected</span>} />
                  <SummaryRow icon={<CalendarDays size={14} strokeWidth={1.75} />} label="Date"
                    value={date
                      ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
                      : <span className="text-neutral-300 italic">Not set</span>} />
                  <SummaryRow icon={<Clock size={14} strokeWidth={1.75} />} label="Time"
                    value={time || <span className="text-neutral-300 italic">Not set</span>} />
                </dl>

                <CardDivider />

                <div className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 border border-neutral-100 mb-4">
                  <Info size={13} strokeWidth={1.75} className="text-neutral-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    The visit will be recorded and accessible to the team. Status updates can be made from the visit detail page.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button variant="primary" size="md" fullWidth loading={isPending} type="submit">
                    Confirm Site Visit
                  </Button>
                  <Button variant="ghost" size="md" fullWidth type="button" onClick={() => navigate('/site-visits')}>
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

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-neutral-300 shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <dt className="text-xs text-neutral-400 mb-0.5">{label}</dt>
        <dd className="text-sm font-normal text-neutral-800">{value}</dd>
      </div>
    </div>
  );
}

export default NewSiteVisitPage;
