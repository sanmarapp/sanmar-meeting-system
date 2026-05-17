import { type ReactNode } from 'react';
import { Calendar, Building2, MapPin, Search, AlertCircle, Lock } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

// ─── Types ─────────────────────────────────────────────────────
type EmptyVariant = 'bookings' | 'rooms' | 'visits' | 'search' | 'error' | 'access' | 'generic';

interface EmptyStateProps {
  variant?:   EmptyVariant;
  title?:     string;
  hint?:      string;
  action?:    { label: string; onClick: () => void };
  className?: string;
}

// ─── Variant config ────────────────────────────────────────────
const variants: Record<
  EmptyVariant,
  { icon: ReactNode; defaultTitle: string; defaultHint: string }
> = {
  bookings: {
    icon: <Calendar size={32} strokeWidth={1.25} className="text-primary-300" />,
    defaultTitle: 'No bookings scheduled yet.',
    defaultHint:  'Reserve a space for your next meeting or discussion.',
  },
  rooms: {
    icon: <Building2 size={32} strokeWidth={1.25} className="text-primary-300" />,
    defaultTitle: 'No rooms match your criteria.',
    defaultHint:  'Try adjusting your filters or search terms.',
  },
  visits: {
    icon: <MapPin size={32} strokeWidth={1.25} className="text-primary-300" />,
    defaultTitle: 'No site visits scheduled.',
    defaultHint:  'Coordinate your next client property walkthrough.',
  },
  search: {
    icon: <Search size={32} strokeWidth={1.25} className="text-neutral-300" />,
    defaultTitle: 'No results found.',
    defaultHint:  'Try adjusting your search or filters.',
  },
  error: {
    icon: <AlertCircle size={32} strokeWidth={1.25} className="text-danger/50" />,
    defaultTitle: 'Unable to load content.',
    defaultHint:  'Please refresh the page or try again later.',
  },
  access: {
    icon: <Lock size={32} strokeWidth={1.25} className="text-neutral-300" />,
    defaultTitle: 'Access restricted.',
    defaultHint:  'Contact your administrator for access.',
  },
  generic: {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-neutral-200">
        <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 14h32" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 20h16M12 25h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    defaultTitle: 'Nothing here yet.',
    defaultHint:  'Data will appear here once available.',
  },
};

// ─── Component ─────────────────────────────────────────────────
export function EmptyState({ variant = 'generic', title, hint, action, className }: EmptyStateProps) {
  const { icon, defaultTitle, defaultHint } = variants[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6',
        className,
      )}
    >
      {/* Illustrated icon */}
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h3 className="font-display text-xl font-semibold text-neutral-800 mb-2">
        {title ?? defaultTitle}
      </h3>
      <p className="text-sm text-neutral-500 max-w-[280px] leading-relaxed mb-6">
        {hint ?? defaultHint}
      </p>

      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
