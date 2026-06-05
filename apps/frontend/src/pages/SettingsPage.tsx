import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Mail, Briefcase, Building2, Shield,
  MessageSquare, KeyRound, CheckCircle2, Eye, EyeOff,
  ToggleLeft, ToggleRight, SlidersHorizontal, ClipboardList,
} from 'lucide-react';
import { authService } from '../services/authService';
import { systemConfigService, type SegmentFlags, type ApprovalConfig } from '../services/auditService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardDivider } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

const ROLE_BADGE: Record<string, 'brand' | 'info' | 'success' | 'neutral' | 'warning'> = {
  SUPER_ADMIN:     'brand',
  ADMIN:           'brand',
  CORPORATE_ADMIN: 'brand',
  DEPT_MANAGER:    'info',
  SALES_HOD:       'info',
  SALES_TEAM:      'success',
  CSD_TEAM:        'success',
  EMPLOYEE:        'neutral',
  RECEPTIONIST:    'neutral',
  SITE_ADMIN:      'warning',
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:     'Super Admin',
  ADMIN:           'Admin',
  CORPORATE_ADMIN: 'Corporate Admin',
  DEPT_MANAGER:    'Head of Dept',
  SALES_HOD:       'Sales HOD',
  SALES_TEAM:      'Sales Team',
  CSD_TEAM:        'CSD Team',
  EMPLOYEE:        'Employee',
  RECEPTIONIST:    'Receptionist',
  SITE_ADMIN:      'Site Admin',
};

// ─── Component ─────────────────────────────────────────────────
export function SettingsPage() {
  const { user, logout } = useAuth();

  // Change password state
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [pwErrors, setPwErrors]     = useState<Record<string, string>>({});
  const [pwSuccess, setPwSuccess]   = useState(false);

  function validatePw(): boolean {
    const e: Record<string, string> = {};
    if (!currentPw) e.currentPw = 'Current password is required.';
    if (!newPw)     e.newPw     = 'New password is required.';
    else if (newPw.length < 8) e.newPw = 'Password must be at least 8 characters.';
    if (newPw && confirmPw && newPw !== confirmPw) e.confirmPw = 'Passwords do not match.';
    if (!confirmPw) e.confirmPw = 'Please confirm your new password.';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  }

  const { mutate: changePw, isPending: changingPw } = useMutation({
    mutationFn: () =>
      authService.changePassword({ currentPassword: currentPw, newPassword: newPw }),
    onSuccess: () => {
      toast.success('Password changed', { description: 'Your password has been updated successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setPwErrors({});
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 4000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to change password.';
      toast.error('Password change failed', { description: Array.isArray(msg) ? msg[0] : msg });
      setPwErrors({ currentPw: 'Current password may be incorrect.' });
    },
  });

  function handlePwSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validatePw()) changePw();
  }

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <AppShell>
      <Header title="Settings" subtitle="Account preferences and security" />

      <div className="flex-1 p-6 space-y-5 animate-fade-in max-w-2xl">

        {/* ── Profile card ── */}
        <Card>
          <CardHeader title="Your Profile" subtitle="Your account information as set by your administrator." />

          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-normal shrink-0"
              style={{ background: 'rgba(130,107,82,0.12)', color: '#826B52' }}
            >
              {initials}
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-neutral-900">{user?.name}</p>
              <p className="text-sm text-neutral-500">{user?.email}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={ROLE_BADGE[user?.role ?? 'STAFF'] ?? 'neutral'}>
                {user?.role?.charAt(0) + (user?.role?.slice(1).toLowerCase() ?? '')}
              </Badge>
            </div>
          </div>

          <CardDivider />

          {/* Detail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileRow icon={<Mail size={15} strokeWidth={1.75} />}       label="Email"       value={user?.email ?? '—'} />
            <ProfileRow icon={<Briefcase size={15} strokeWidth={1.75} />}  label="Designation" value={user?.designation ?? '—'} />
            <ProfileRow icon={<Building2 size={15} strokeWidth={1.75} />}  label="Department"  value={user?.department?.name ?? '—'} />
            <ProfileRow icon={<Shield size={15} strokeWidth={1.75} />}     label="Employee ID" value={user?.employeeId ?? '—'} />
          </div>

          <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <p className="text-xs text-neutral-500">
              Profile details are managed by your system administrator. Contact your admin to update your name, role, or department.
            </p>
          </div>
        </Card>

        {/* ── Notifications card ── */}
        <Card>
          <CardHeader title="Notifications" subtitle="Control how you receive booking and approval updates." />
          <div className="space-y-4">
            <ToggleRow
              icon={<Mail size={15} strokeWidth={1.75} />}
              label="Email notifications"
              hint="Receive booking confirmations and status updates via email."
              checked={user?.notifyEmail ?? false}
              disabled
            />
            <ToggleRow
              icon={<MessageSquare size={15} strokeWidth={1.75} />}
              label="WhatsApp notifications"
              hint="Receive instant alerts on WhatsApp for urgent updates."
              checked={user?.notifyWhatsapp ?? false}
              disabled
            />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <p className="text-xs text-neutral-500">
              Notification preferences are managed by your administrator. Contact your admin to update these settings.
            </p>
          </div>
        </Card>

        {/* ── Change password ── */}
        <Card>
          <CardHeader title="Change Password" subtitle="Update your login password. Use at least 8 characters." />

          {pwSuccess && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4 text-sm font-normal"
              style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle2 size={14} strokeWidth={2} />
              Password changed successfully.
            </div>
          )}

          <form onSubmit={handlePwSubmit} noValidate className="space-y-4">
            <Input
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPw}
              onChange={e => { setCurrentPw(e.target.value); setPwErrors(p => ({ ...p, currentPw: '' })); }}
              error={pwErrors.currentPw}
              prefix={<KeyRound size={14} strokeWidth={1.75} />}
              suffix={
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  {showCurrent ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                </button>
              }
              required
              fullWidth
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setPwErrors(p => ({ ...p, newPw: '', confirmPw: '' })); }}
                error={pwErrors.newPw}
                hint="Minimum 8 characters"
                suffix={
                  <button type="button" onClick={() => setShowNew(v => !v)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                    {showNew ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                  </button>
                }
                required
                fullWidth
              />
              <Input
                label="Confirm New Password"
                type={showNew ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setPwErrors(p => ({ ...p, confirmPw: '' })); }}
                error={pwErrors.confirmPw}
                required
                fullWidth
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={changingPw}
                icon={<KeyRound size={13} strokeWidth={2} />}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* ── Super Admin panels ── */}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
          <>
            <SegmentPanel />
            <ApprovalRoutingPanel />
          </>
        )}

        {/* ── Session card ── */}
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-neutral-800">Session</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {user?.lastLoginAt
                  ? `Last login: ${new Date(user.lastLoginAt).toLocaleString('en-GB')}`
                  : 'Active session'}
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => { logout(); }}
            >
              Sign Out
            </Button>
          </div>
        </Card>

      </div>
    </AppShell>
  );
}

// ── Segment Toggle Panel ────────────────────────────────────────────────────────

function SegmentPanel() {
  const qc = useQueryClient();
  const { data: segments, isLoading } = useQuery<SegmentFlags>({
    queryKey: ['segments'],
    queryFn:  () => systemConfigService.getSegments(),
  });

  const [local, setLocal] = useState<SegmentFlags | null>(null);
  const current = local ?? segments;

  const saveMutation = useMutation({
    mutationFn: () => systemConfigService.saveEntries([
      { key: 'seg_bookings',       value: String(current!.bookings) },
      { key: 'seg_external_books', value: String(current!.externalBookings) },
      { key: 'seg_site_visits',    value: String(current!.siteVisits) },
      { key: 'seg_fairs',          value: String(current!.fairs) },
    ]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['segments'] });
      setLocal(null);
      toast.success('Segment settings saved');
    },
    onError: () => toast.error('Failed to save segment settings'),
  });

  const toggle = (key: keyof SegmentFlags) => {
    setLocal(prev => ({ ...(prev ?? segments!), [key]: !(prev ?? segments!)[key] }));
  };

  const isDirty = local !== null;

  const rows: { key: keyof SegmentFlags; label: string; hint: string }[] = [
    { key: 'bookings',         label: 'Meeting Room Bookings',   hint: 'Allow staff to create new room bookings' },
    { key: 'externalBookings', label: 'External Client Meetings', hint: 'Allow bookings for external / client meetings' },
    { key: 'siteVisits',       label: 'Site Visits',             hint: 'Allow new site visit scheduling' },
    { key: 'fairs',            label: 'Property Fairs',          hint: 'Allow fair creation and visitor registration' },
  ];

  return (
    <Card>
      <CardHeader
        title="Segment Controls"
        subtitle="Enable or disable entire functional segments system-wide."
        action={<ToggleLeft size={15} strokeWidth={1.75} className="text-neutral-400" />}
      />
      {isLoading || !current ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-12 rounded-lg bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {rows.map(r => (
            <div key={r.key} className="flex items-center justify-between gap-4 py-2.5 border-b border-neutral-100 last:border-0">
              <div>
                <p className="text-sm font-normal text-neutral-800">{r.label}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{r.hint}</p>
              </div>
              <button
                onClick={() => toggle(r.key)}
                className="flex items-center gap-2 transition-colors"
                title={current[r.key] ? 'Click to disable' : 'Click to enable'}
              >
                <span className={`text-xs font-medium ${current[r.key] ? 'text-emerald-600' : 'text-neutral-400'}`}>
                  {current[r.key] ? 'Enabled' : 'Disabled'}
                </span>
                {current[r.key]
                  ? <ToggleRight size={22} className="text-emerald-500" />
                  : <ToggleLeft  size={22} className="text-neutral-300" />}
              </button>
            </div>
          ))}
        </div>
      )}
      {isDirty && (
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-100">
          <Button variant="ghost" size="sm" onClick={() => setLocal(null)}>Revert</Button>
          <Button variant="primary" size="sm" loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}>
            Save Changes
          </Button>
        </div>
      )}
    </Card>
  );
}

// ── Approval Routing Panel ──────────────────────────────────────────────────────

function ApprovalRoutingPanel() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery<ApprovalConfig>({
    queryKey: ['approval-config'],
    queryFn:  () => systemConfigService.getApprovalConfig(),
  });

  const [local, setLocal] = useState<ApprovalConfig | null>(null);
  const current = local ?? config;

  const saveMutation = useMutation({
    mutationFn: () => systemConfigService.saveEntries([
      { key: 'appr_board_required',    value: String(current!.boardRoomRequired) },
      { key: 'appr_duration_mins',     value: String(current!.durationThresholdMins) },
      { key: 'appr_external_required', value: String(current!.externalMeetingRequired) },
    ]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approval-config'] });
      setLocal(null);
      toast.success('Approval config saved');
    },
    onError: () => toast.error('Failed to save approval config'),
  });

  const setField = <K extends keyof ApprovalConfig>(key: K, val: ApprovalConfig[K]) =>
    setLocal(prev => ({ ...(prev ?? config!), [key]: val }));

  const isDirty = local !== null;

  return (
    <Card>
      <CardHeader
        title="Approval Routing"
        subtitle="Configure which booking types trigger the approval workflow."
        action={<SlidersHorizontal size={15} strokeWidth={1.75} className="text-neutral-400" />}
      />
      {isLoading || !current ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-neutral-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Board room approval */}
          <div className="flex items-center justify-between gap-4 py-2.5 border-b border-neutral-100">
            <div>
              <p className="text-sm font-normal text-neutral-800">Board Room requires approval</p>
              <p className="text-xs text-neutral-400 mt-0.5">Board room bookings must be approved by HOD then Admin</p>
            </div>
            <button onClick={() => setField('boardRoomRequired', !current.boardRoomRequired)} className="flex items-center gap-2">
              <span className={`text-xs font-medium ${current.boardRoomRequired ? 'text-emerald-600' : 'text-neutral-400'}`}>
                {current.boardRoomRequired ? 'Required' : 'Not Required'}
              </span>
              {current.boardRoomRequired
                ? <ToggleRight size={22} className="text-emerald-500" />
                : <ToggleLeft  size={22} className="text-neutral-300" />}
            </button>
          </div>

          {/* External meeting approval */}
          <div className="flex items-center justify-between gap-4 py-2.5 border-b border-neutral-100">
            <div>
              <p className="text-sm font-normal text-neutral-800">External meetings require approval</p>
              <p className="text-xs text-neutral-400 mt-0.5">All external / client meeting bookings require approval</p>
            </div>
            <button onClick={() => setField('externalMeetingRequired', !current.externalMeetingRequired)} className="flex items-center gap-2">
              <span className={`text-xs font-medium ${current.externalMeetingRequired ? 'text-emerald-600' : 'text-neutral-400'}`}>
                {current.externalMeetingRequired ? 'Required' : 'Not Required'}
              </span>
              {current.externalMeetingRequired
                ? <ToggleRight size={22} className="text-emerald-500" />
                : <ToggleLeft  size={22} className="text-neutral-300" />}
            </button>
          </div>

          {/* Duration threshold */}
          <div className="flex items-start justify-between gap-4 py-2.5">
            <div>
              <p className="text-sm font-normal text-neutral-800">Duration threshold</p>
              <p className="text-xs text-neutral-400 mt-0.5">Meetings longer than this require approval</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                type="number" min={30} max={480} step={15}
                value={String(current.durationThresholdMins)}
                onChange={e => setField('durationThresholdMins', +e.target.value)}
                fullWidth={false}
              />
              <span className="text-sm text-neutral-500 whitespace-nowrap">minutes</span>
            </div>
          </div>
        </div>
      )}
      {isDirty && (
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-100">
          <Button variant="ghost" size="sm" onClick={() => setLocal(null)}>Revert</Button>
          <Button variant="primary" size="sm" loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}>
            Save Changes
          </Button>
        </div>
      )}
    </Card>
  );
}

// ─── Sub-components ────────────────────────────────────────────
function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-neutral-300 shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm font-normal text-neutral-800">{value}</p>
      </div>
    </div>
  );
}

function ToggleRow({
  icon, label, hint, checked, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-2.5">
        <span className="text-neutral-300 shrink-0 mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-normal text-neutral-800">{label}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{hint}</p>
        </div>
      </div>
      {/* Read-only toggle */}
      <div
        className="w-9 h-5 rounded-full flex items-center px-0.5 shrink-0"
        style={{ background: checked ? 'var(--brand)' : 'var(--border-strong)', opacity: disabled ? 0.6 : 1 }}
      >
        <div
          className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
    </div>
  );
}

export default SettingsPage;
