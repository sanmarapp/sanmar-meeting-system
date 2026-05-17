import { type ReactNode } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ─────────────────────────────────────────────────────
interface HeaderProps {
  title:     string;
  subtitle?: string;
  action?:   ReactNode;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────
export function Header({ title, subtitle, action, className }: HeaderProps) {
  const { user } = useAuth();
  const location = user?.locations?.[0]?.name ?? 'Dhaka HQ';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-[54px] bg-white border-b border-neutral-200',
        'flex items-center justify-between px-6 shrink-0',
        className,
      )}
    >
      {/* Left — title */}
      <div>
        <h1 className="font-display text-xl font-semibold text-neutral-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-neutral-500 leading-none mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right — location + notif + CTA */}
      <div className="flex items-center gap-2.5">
        {/* Location pill */}
        <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600">
          <MapPin size={11} strokeWidth={2} className="text-neutral-400" />
          {location}
        </div>

        {/* Notification bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors">
          <Bell size={14} strokeWidth={1.75} />
          {/* unread dot — conditionally render based on real notifications */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-warning border border-white" aria-hidden />
        </button>

        {/* Page CTA */}
        {action}
      </div>
    </header>
  );
}

export default Header;
