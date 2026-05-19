import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AUTH } from '../lib/copy';

// ─── Login Page ────────────────────────────────────────────────
export function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passError,  setPassError]  = useState('');

  function validate(): boolean {
    let ok = true;
    if (!email) {
      setEmailError('Email address is required');
      ok = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address');
      ok = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPassError('Password is required');
      ok = false;
    } else {
      setPassError('');
    }
    return ok;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { mustChangePassword } = await login({ email, password });
      if (mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(
        msg.includes('credentials') || msg.includes('Invalid')
          ? 'Incorrect email or password. Please try again.'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F6F5' }}>

      {/* ── Left — Brand panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden login-brand-panel"
        style={{ background: '#1A1614' }}
      >
        {/* CSS animated background (zero load time) */}
        <div className="login-bg-anim" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
          <span className="orb orb-4" />
          <span className="grid-lines" />
        </div>

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center px-16 text-center">
          {/* Logo */}
          <img
            src="/logo.svg"
            alt="Sanmar Properties"
            className="w-[160px] h-auto mb-8"
            draggable={false}
          />

          {/* Tagline */}
          <p
            className="text-[11px] font-normal uppercase tracking-[0.20em]"
            style={{ color: 'rgba(201,169,122,0.55)' }}
          >
            Meeting Room & Site Visit System
          </p>

          {/* Divider */}
          <div
            className="mt-6 mb-8"
            style={{ width: '32px', height: '1px', background: 'rgba(201,169,122,0.25)' }}
          />

          {/* Descriptor */}
          <p
            className="text-[13px] font-normal leading-relaxed max-w-[260px]"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            Internal operations platform for Sanmar Properties
          </p>
        </div>

        {/* Bottom location badge */}
        <div
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-normal uppercase tracking-[0.12em]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            <span className="w-1 h-1 rounded-full bg-success opacity-70" />
            Dhaka · Chattogram
          </div>
        </div>
      </div>

      {/* ── Right — Form panel ─────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[440px] shrink-0 px-6 py-12">

        {/* Mobile logo */}
        <div className="flex justify-center mb-10 lg:hidden">
          <div
            className="flex items-center justify-center rounded-2xl px-7 py-5"
            style={{ background: '#1A1614' }}
          >
            <img
              src="/logo.svg"
              alt="Sanmar"
              className="w-[128px] h-auto"
              draggable={false}
            />
          </div>
        </div>

        {/* Form block */}
        <div className="w-full max-w-[360px]">

          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-display text-[26px] font-semibold text-neutral-900 leading-tight tracking-tight mb-1.5">
              {AUTH.loginTitle}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {AUTH.loginSubtitle}
            </p>
          </div>

          {/* Card */}
          <div
            className="bg-white rounded-2xl p-6"
            style={{
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
            }}
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              <Input
                label="Email address"
                type="email"
                placeholder="you@mysanmar.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={emailError}
                prefix={<Mail size={14} strokeWidth={1.75} />}
                autoComplete="email"
                autoFocus
                required
              />

              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={passError}
                prefix={<Lock size={14} strokeWidth={1.75} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="transition-colors hover:text-neutral-600"
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass
                      ? <EyeOff size={14} strokeWidth={1.75} />
                      : <Eye    size={14} strokeWidth={1.75} />
                    }
                  </button>
                }
                autoComplete="current-password"
                required
              />

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  fullWidth
                  iconRight={!loading ? <ArrowRight size={14} strokeWidth={2} /> : undefined}
                  className="font-normal"
                >
                  {AUTH.loginCta}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-neutral-400 mt-6 leading-relaxed">
            Sanmar Properties · Internal Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
