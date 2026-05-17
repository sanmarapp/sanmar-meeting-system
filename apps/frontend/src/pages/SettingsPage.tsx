import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User, Mail, Briefcase, Building2, Shield,
  Bell, MessageSquare, KeyRound, CheckCircle2, Eye, EyeOff,
} from 'lucide-react';
import { authService } from '../services/authService';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardDivider } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

const ROLE_BADGE: Record<string, 'brand' | 'info' | 'success' | 'neutral'> = {
  ADMIN:   'brand',
  MANAGER: 'info',
  STAFF:   'success',
  VIEWER:  'neutral',
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
        style={{ background: checked ? '#826B52' : '#E5E1DB', opacity: disabled ? 0.6 : 1 }}
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
