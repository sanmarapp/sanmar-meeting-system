import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

// ─── Types ─────────────────────────────────────────────────────
type BadgeVariant =
  | 'success' | 'warning' | 'danger' | 'info'
  | 'neutral' | 'brand'   | 'pending' | 'gold';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?:   BadgeVariant;
  size?:      BadgeSize;
  dot?:       boolean;
  children:   ReactNode;
  className?: string;
}

// ─── Styles — Stripe-quality status badges ─────────────────────
const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  success: {
    bg:     'bg-success-50',
    text:   'text-success-700',
    border: 'border-success-200',
    dot:    'bg-success',
  },
  warning: {
    bg:     'bg-warning-50',
    text:   'text-warning-600',
    border: 'border-warning-200',
    dot:    'bg-warning',
  },
  danger: {
    bg:     'bg-danger-50',
    text:   'text-danger-600',
    border: 'border-danger-200',
    dot:    'bg-danger',
  },
  info: {
    bg:     'bg-info-50',
    text:   'text-info-600',
    border: 'border-info-200',
    dot:    'bg-info',
  },
  neutral: {
    bg:     'bg-neutral-100',
    text:   'text-neutral-600',
    border: 'border-neutral-200',
    dot:    'bg-neutral-400',
  },
  pending: {
    bg:     'bg-warning-50',
    text:   'text-warning-600',
    border: 'border-warning-200',
    dot:    'bg-warning',
  },
  brand: {
    bg:     'bg-primary-50',
    text:   'text-primary-600',
    border: 'border-primary-200',
    dot:    'bg-primary-500',
  },
  gold: {
    bg:     'bg-[rgba(201,169,122,0.10)]',
    text:   'text-[#9A7A4A]',
    border: 'border-[rgba(201,169,122,0.25)]',
    dot:    'bg-[#C9A97A]',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] gap-1',
  md: 'px-2   py-[3px] text-xs gap-1.5',
};

// ─── Status helpers ────────────────────────────────────────────
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type VisitStatus   = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'CLIENT_NO_SHOW';

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
    SCHEDULED:      'info',
    COMPLETED:      'success',
    CANCELLED:      'neutral',
    NO_SHOW:        'danger',
    CLIENT_NO_SHOW: 'danger',
    RESCHEDULED:    'warning',
  };
  return map[status] ?? 'neutral';
}

export function visitStatusLabel(status: VisitStatus): string {
  const map: Record<VisitStatus, string> = {
    SCHEDULED:      'Scheduled',
    COMPLETED:      'Completed',
    CANCELLED:      'Cancelled',
    NO_SHOW:        'No Show',
    CLIENT_NO_SHOW: 'Client No Show',
    RESCHEDULED:    'Rescheduled',
  };
  return map[status] ?? status;
}

// ─── Component ─────────────────────────────────────────────────
export function Badge({
  variant = 'neutral',
  size    = 'md',
  dot     = true,
  children,
  className,
}: BadgeProps) {
  const { bg, text, border, dot: dotColor } = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center font-normal whitespace-nowrap',
        'rounded-full border',
        bg, text, border,
        sizeStyles[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('rounded-full shrink-0 flex-none', dotColor,
            size === 'sm' ? 'w-[5px] h-[5px]' : 'w-1.5 h-1.5'
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
