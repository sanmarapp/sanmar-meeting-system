import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AUTH } from '../lib/copy';

export function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [emailError,  setEmailError]  = useState('');
  const [passError,   setPassError]   = useState('');

  function validate(): boolean {
    let valid = true;
    if (!email) {
      setEmailError('Email address is required.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPassError('Password is required.');
      valid = false;
    } else {
      setPassError('');
    }
    return valid;
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
      toast.error(msg.includes('credentials') || msg.includes('Invalid')
        ? 'Invalid email or password. Please try again.'
        : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#F5F3F0' }}
    >
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden login-brand-panel"
        style={{ background: '#1A1614' }}
      >
        {/* CSS animated background — zero load time */}
        <div className="login-bg-anim" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
          <span className="orb orb-4" />
          <span className="grid-lines" />
        </div>

        {/* Content — above animation */}
        <div className="relative z-10 flex flex-col items-center px-12">
          {/* Wordmark */}
          <img
            src="/logo.svg"
            alt="Sanmar"
            className="w-[200px] h-auto"
            draggable={false}
          />

          {/* Divider */}
          <div
            className="mt-6 mb-5"
            style={{
              width: '40px',
              height: '1px',
              background: 'rgba(201,169,122,0.35)',
            }}
          />

          {/* Tagline */}
          <p
            className="text-[11px] font-normal uppercase tracking-[0.18em] text-center"
            style={{ color: 'rgba(201,169,122,0.55)' }}
          >
            Meeting Room Booking
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[460px] shrink-0 px-6 py-12">

        {/* Mobile-only wordmark */}
        <div className="flex justify-center mb-8 lg:hidden">
          <div
            className="flex items-center justify-center rounded-2xl px-6 py-4"
            style={{ background: '#1A1614' }}
          >
            <img
              src="/logo.svg"
              alt="Sanmar"
              className="w-[140px] h-auto"
              draggable={false}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="w-full max-w-[360px]">
          <h1 className="font-display text-2xl font-semibold text-neutral-900 mb-1">
            {AUTH.loginTitle}
          </h1>
          <p className="text-sm text-neutral-400 mb-7 leading-relaxed">
            {AUTH.loginSubtitle}
          </p>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-7">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@mysanmar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                prefix={<Mail size={14} strokeWidth={1.75} />}
                autoComplete="email"
                required
              />

              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passError}
                prefix={<Lock size={14} strokeWidth={1.75} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass
                      ? <EyeOff size={14} strokeWidth={1.75} />
                      : <Eye size={14} strokeWidth={1.75} />
                    }
                  </button>
                }
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
                className="mt-6"
              >
                {AUTH.loginCta}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-neutral-400 mt-6">
            Sanmar Properties · Internal Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
