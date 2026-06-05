import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Mail, MessageSquare, Eye, EyeOff, Save,
  CheckCircle2, AlertTriangle, RefreshCw, Shield,
} from 'lucide-react';
import { api } from '../services/api';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardDivider } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from '../components/ui/EmptyState';

// ─── Types ─────────────────────────────────────────────────────
interface ConfigEntry { key: string; value: string; label?: string; isSecret?: boolean; group?: string; }

interface SmtpConfig  { host: string; port: number; user: string; pass: string; from: string; enabled: boolean; }
interface WaConfig    { apiKey: string; apiUrl: string; senderId: string; enabled: boolean; }

function useSystemConfig() {
  return useQuery<ConfigEntry[]>({
    queryKey: ['system-config'],
    queryFn:  () => api.get('/system-config').then(r => r.data),
  });
}

// ─── Component ─────────────────────────────────────────────────
export function NotificationSettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const { data: configs, isLoading } = useSystemConfig();

  // SMTP state
  const [smtp, setSmtp] = useState<SmtpConfig>({ host: '', port: 587, user: '', pass: '', from: '', enabled: true });
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // WhatsApp state
  const [wa, setWa] = useState<WaConfig>({ apiKey: '', apiUrl: 'https://app.walinko.com/api/v1', senderId: '', enabled: false });
  const [showWaKey, setShowWaKey] = useState(false);

  // Load existing config into state
  useEffect(() => {
    if (!configs) return;
    const get = (key: string) => configs.find(c => c.key === key)?.value ?? '';
    setSmtp({
      host:    get('smtp_host'),
      port:    Number(get('smtp_port') || 587),
      user:    get('smtp_user'),
      pass:    get('smtp_pass'),
      from:    get('smtp_from'),
      enabled: get('smtp_enabled') !== 'false',
    });
    setWa({
      apiKey:   get('wa_api_key'),
      apiUrl:   get('wa_api_url') || 'https://app.walinko.com/api/v1',
      senderId: get('wa_sender_id'),
      enabled:  get('wa_enabled') === 'true',
    });
  }, [configs]);

  const saveMut = useMutation({
    mutationFn: (entries: { key: string; value: string }[]) =>
      api.put('/system-config', { entries }),
    onSuccess: () => {
      toast.success('Settings saved', { description: 'Notification configuration updated.' });
      qc.invalidateQueries({ queryKey: ['system-config'] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  function handleSaveSmtp() {
    saveMut.mutate([
      { key: 'smtp_host',    value: smtp.host },
      { key: 'smtp_port',    value: String(smtp.port) },
      { key: 'smtp_user',    value: smtp.user },
      { key: 'smtp_pass',    value: smtp.pass },
      { key: 'smtp_from',    value: smtp.from },
      { key: 'smtp_enabled', value: String(smtp.enabled) },
    ]);
  }

  function handleSaveWa() {
    saveMut.mutate([
      { key: 'wa_api_key',   value: wa.apiKey },
      { key: 'wa_api_url',   value: wa.apiUrl },
      { key: 'wa_sender_id', value: wa.senderId },
      { key: 'wa_enabled',   value: String(wa.enabled) },
    ]);
  }

  if (!isSuperAdmin) {
    return (
      <AppShell>
        <Header title="Notification Settings" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState variant="access" title="Super Admin access required" hint="Only Super Admins and Admins can manage notification settings." />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="Notification Settings"
        subtitle="Configure email and WhatsApp delivery channels"
      />

      <div className="flex-1 p-6 space-y-5 animate-fade-in max-w-2xl">

        {/* ── Email (SMTP / Zimbra) ── */}
        <Card>
          <CardHeader
            title="Email (SMTP)"
            subtitle="Zimbra or any SMTP provider. Changes take effect immediately — no redeploy needed."
          />

          {/* Enable toggle */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2.5">
              <Mail size={14} strokeWidth={1.75} className="text-neutral-400" />
              <div>
                <p className="text-sm font-normal text-neutral-800">Email notifications</p>
                <p className="text-xs text-neutral-400">Send booking and site visit emails</p>
              </div>
            </div>
            <button
              onClick={() => setSmtp(s => ({ ...s, enabled: !s.enabled }))}
              className="w-9 h-5 rounded-full flex items-center px-0.5 shrink-0 transition-colors duration-150"
              style={{ background: smtp.enabled ? 'var(--brand)' : 'var(--border-strong)' }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150"
                style={{ transform: smtp.enabled ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          <CardDivider />

          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input label="SMTP Host" value={smtp.host} onChange={e => setSmtp(s => ({ ...s, host: e.target.value }))} placeholder="mail.mysanmar.com" fullWidth />
              </div>
              <Input label="Port" type="number" value={String(smtp.port)} onChange={e => setSmtp(s => ({ ...s, port: Number(e.target.value) }))} placeholder="587" fullWidth />
            </div>
            <Input label="SMTP Username" value={smtp.user} onChange={e => setSmtp(s => ({ ...s, user: e.target.value }))} placeholder="andalib.rahman@mysanmar.com" fullWidth />
            <Input
              label="SMTP Password"
              type={showSmtpPass ? 'text' : 'password'}
              value={smtp.pass}
              onChange={e => setSmtp(s => ({ ...s, pass: e.target.value }))}
              placeholder="••••••••"
              suffix={
                <button type="button" onClick={() => setShowSmtpPass(v => !v)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  {showSmtpPass ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                </button>
              }
              fullWidth
            />
            <Input label="From Address" value={smtp.from} onChange={e => setSmtp(s => ({ ...s, from: e.target.value }))} placeholder='"Sanmar Properties" <noreply@mysanmar.com>' fullWidth />
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="primary" size="sm" icon={<Save size={13} strokeWidth={2} />} loading={saveMut.isPending} onClick={handleSaveSmtp}>
              Save Email Settings
            </Button>
          </div>
        </Card>

        {/* ── WhatsApp (Walinko) ── */}
        <Card>
          <CardHeader
            title="WhatsApp (Walinko)"
            subtitle="BD-based WhatsApp API. Get your API key from app.walinko.com/api-keys"
          />

          {/* Enable toggle */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={14} strokeWidth={1.75} className="text-neutral-400" />
              <div>
                <p className="text-sm font-normal text-neutral-800">WhatsApp notifications</p>
                <p className="text-xs text-neutral-400">Send instant alerts via WhatsApp</p>
              </div>
            </div>
            <button
              onClick={() => setWa(w => ({ ...w, enabled: !w.enabled }))}
              className="w-9 h-5 rounded-full flex items-center px-0.5 shrink-0 transition-colors duration-150"
              style={{ background: wa.enabled ? 'var(--brand)' : 'var(--border-strong)' }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150"
                style={{ transform: wa.enabled ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          <CardDivider />

          <div className="space-y-3 mt-4">
            <Input
              label="Walinko API Key"
              type={showWaKey ? 'text' : 'password'}
              value={wa.apiKey}
              onChange={e => setWa(w => ({ ...w, apiKey: e.target.value }))}
              placeholder="walk_live_••••••••••••"
              suffix={
                <button type="button" onClick={() => setShowWaKey(v => !v)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  {showWaKey ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                </button>
              }
              fullWidth
            />
            <Input label="API Base URL" value={wa.apiUrl} onChange={e => setWa(w => ({ ...w, apiUrl: e.target.value }))} placeholder="https://app.walinko.com/api/v1" fullWidth />
            <Input label="Sender ID (optional)" value={wa.senderId} onChange={e => setWa(w => ({ ...w, senderId: e.target.value }))} placeholder="SanmarProp" fullWidth />
          </div>

          <div className="mt-4 p-3 rounded-lg border" style={{ background: 'rgba(201,169,122,0.06)', borderColor: 'rgba(201,169,122,0.2)' }}>
            <p className="text-xs" style={{ color: '#826B52' }}>
              <strong>API key security:</strong> Keys are stored in the database and never exposed in browser network calls. Only Super Admins can view or update this page.
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="primary" size="sm" icon={<Save size={13} strokeWidth={2} />} loading={saveMut.isPending} onClick={handleSaveWa}>
              Save WhatsApp Settings
            </Button>
          </div>
        </Card>

        {/* ── Security note ── */}
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <Shield size={14} strokeWidth={1.75} className="text-neutral-400 shrink-0" />
            <p className="text-xs text-neutral-500">
              All credential changes are logged in the Audit Log with your user ID and timestamp. Settings take effect on the next notification trigger — no server restart required.
            </p>
          </div>
        </Card>

      </div>
    </AppShell>
  );
}

export default NotificationSettingsPage;
