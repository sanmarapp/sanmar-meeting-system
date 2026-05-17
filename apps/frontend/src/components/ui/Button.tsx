import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Loader2 } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

// ─── Variant styles ────────────────────────────────────────────
const variants: Record<Variant, string> = {
  primary:
    'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 hover:border-primary-600 ' +
    'active:bg-primary-700 shadow-xs',
  secondary:
    'bg-white text-primary-500 border-primary-200 hover:bg-primary-50 hover:border-primary-300 ' +
    'active:bg-primary-100',
  ghost:
    'bg-transparent text-neutral-600 border-transparent hover:bg-neutral-100 hover:text-neutral-900 ' +
    'active:bg-neutral-200',
  danger:
    'bg-white text-danger border-danger/30 hover:bg-danger/5 hover:border-danger/50 ' +
    'active:bg-danger/10',
  outline:
    'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 ' +
    'active:bg-neutral-100',
};

const sizes: Record<Size, string> = {
  xs: 'h-7  px-3   text-xs  gap-1.5 rounded',
  sm: 'h-8  px-3.5 text-sm  gap-1.5 rounded',
  md: 'h-9  px-4   text-base gap-2   rounded-md',
  lg: 'h-11 px-5   text-md  gap-2   rounded-lg',
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
          // Base
          'inline-flex items-center justify-center font-sans font-normal',
          'border transition-all duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
          // Variant + size
          variants[variant],
          sizes[size],
          // States
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'xs' || size === 'sm' ? 13 : 14} />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
