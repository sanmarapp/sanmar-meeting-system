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
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-[400px]">

        {/* S Icon logo — login branding only */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-md">
            <span
              className="text-white text-4xl font-normal leading-none select-none"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              S
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-neutral-900 mb-2">
            {AUTH.loginTitle}
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            {AUTH.loginSubtitle}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-7">
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
  );
}

export default LoginPage;
