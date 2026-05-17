import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

// ─── Types ─────────────────────────────────────────────────────
type BadgeVariant =
  | 'success' | 'warning' | 'danger' | 'info'
  | 'neutral' | 'brand'   | 'pending';

interface BadgeProps {
  variant?:    BadgeVariant;
  dot?:        boolean;
  children:    ReactNode;
  className?:  string;
}

// ─── Styles ────────────────────────────────────────────────────
const variantStyles: Record<BadgeVariant, { pill: string; dot: string }> = {
  success: { pill: 'bg-success-light text-success border border-success/25',  dot: 'bg-success' },
  warning: { pill: 'bg-warning-light text-warning border border-warning/25',  dot: 'bg-warning' },
  danger:  { pill: 'bg-danger-light  text-danger  border border-danger/25',   dot: 'bg-danger'  },
  info:    { pill: 'bg-info-light    text-info    border border-info/25',     dot: 'bg-info'    },
  neutral: { pill: 'bg-neutral-100   text-neutral-600 border border-neutral-200', dot: 'bg-neutral-400' },
  brand:   { pill: 'bg-primary-50    text-primary-600 border border-primary-200', dot: 'bg-primary-500' },
  pending: { pill: 'bg-warning-light text-warning border border-warning/25',  dot: 'bg-warning' },
};

// ─── Booking / Visit status helpers ───────────────────────────
export type BookingStatus   = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type VisitStatus     = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export function bookingStatusVariant(status: BookingStatus): BadgeVariant {
  const map: Record<BookingStatus, BadgeVariant> = {
    PENDING:   'pending',
    APPROVED:  'success',
    REJECTED:  'danger',
    CANCELLED: 'neutral',
    COMPLETED: 'brand',
  };
  return map[status] ?? 'neutral';
}

export function bookingStatusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    PENDING:   'Pending Approval',
    APPROVED:  'Confirmed',
    REJECTED:  'Rejected',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  };
  return map[status] ?? status;
}

export function visitStatusVariant(status: VisitStatus): BadgeVariant {
  const map: Record<VisitStatus, BadgeVariant> = {
    SCHEDULED:  'info',
    COMPLETED:  'success',
    CANCELLED:  'neutral',
    NO_SHOW:    'danger',
  };
  return map[status] ?? 'neutral';
}

// ─── Component ─────────────────────────────────────────────────
export function Badge({ variant = 'neutral', dot = true, children, className }: BadgeProps) {
  const { pill, dot: dotColor } = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5',
        'rounded-full text-xs font-normal whitespace-nowrap',
        pill,
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} aria-hidden />
      )}
      {children}
    </span>
  );
}

export default Badge;
