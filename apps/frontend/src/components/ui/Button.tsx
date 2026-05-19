import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Loader2 } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  icon?:      ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

// ─── Styles ────────────────────────────────────────────────────
const variants: Record<Variant, string> = {
  primary:
    // Dark brown — confident, premium. Lifts on hover like Stripe/Linear.
    'bg-primary-500 text-white border-primary-600/60 ' +
    'shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.10)] ' +
    'hover:bg-primary-600 hover:-translate-y-px hover:shadow-[0_2px_6px_rgba(0,0,0,0.14)] ' +
    'active:translate-y-0 active:bg-primary-700 active:shadow-none',

  secondary:
    // White button with warm border
    'bg-white text-primary-700 border-neutral-200 ' +
    'shadow-xs hover:bg-neutral-75 hover:border-neutral-300 hover:-translate-y-px ' +
    'active:translate-y-0 active:bg-neutral-100 active:shadow-none',

  outline:
    'bg-transparent text-neutral-700 border-neutral-200 ' +
    'hover:bg-neutral-75 hover:border-neutral-300 hover:text-neutral-900 ' +
    'active:bg-neutral-100',

  ghost:
    'bg-transparent text-neutral-600 border-transparent ' +
    'hover:bg-neutral-100 hover:text-neutral-900 ' +
    'active:bg-neutral-150',

  danger:
    'bg-white text-danger-600 border-danger-200 ' +
    'shadow-xs hover:bg-danger-50 hover:border-danger-300 ' +
    'active:bg-danger-100',

  link:
    'bg-transparent text-primary-500 border-transparent underline-offset-2 ' +
    'hover:text-primary-700 hover:underline ' +
    'p-0 h-auto shadow-none',
};

const sizes: Record<Size, string> = {
  xs: 'h-7   px-2.5 text-xs  gap-1.5 rounded-md',
  sm: 'h-8   px-3   text-sm  gap-1.5 rounded-md',
  md: 'h-9   px-3.5 text-base gap-2   rounded-lg',
  lg: 'h-[42px] px-5 text-md  gap-2   rounded-lg',
};

// ─── Component ─────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base — all buttons share these
          'inline-flex items-center justify-center font-sans font-normal whitespace-nowrap',
          'border transition-all duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-primary-500/30 focus-visible:ring-offset-1',
          variant !== 'link' && 'shadow-xs',
          // Variant
          variants[variant],
          // Size
          sizes[size],
          // States
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none !translate-y-0 !shadow-none',
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className="animate-spin shrink-0"
            size={size === 'xs' || size === 'sm' ? 12 : 14}
            strokeWidth={2}
          />
        ) : (
          icon && <span className="shrink-0 flex items-center">{icon}</span>
        )}
        {children && <span className="leading-none">{children}</span>}
        {iconRight && !loading && (
          <span className="shrink-0 flex items-center">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
