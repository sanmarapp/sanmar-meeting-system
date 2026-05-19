import { type HTMLAttributes, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/cn';

// ─── Card ──────────────────────────────────────────────────────
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?:   'none' | 'xs' | 'sm' | 'md' | 'lg';
  hover?:     boolean;
  variant?:   'default' | 'ghost' | 'bordered';
}

const paddings = {
  none: '',
  xs:   'p-3',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({
  padding = 'md',
  hover   = false,
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base
        'rounded-xl bg-white',
        // Variant
        variant === 'default'  && 'border border-neutral-200 shadow-xs',
        variant === 'ghost'    && 'bg-neutral-75',
        variant === 'bordered' && 'border-2 border-neutral-200',
        // Padding
        paddings[padding],
        // Hover lift
        hover && 'transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-px',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── CardHeader ────────────────────────────────────────────────
interface CardHeaderProps {
  title:      string;
  subtitle?:  string;
  action?:    ReactNode;
  className?: string;
  border?:    boolean;
}

export function CardHeader({ title, subtitle, action, className, border = false }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        border ? 'pb-4 mb-4 border-b border-neutral-100' : 'mb-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-base font-normal text-neutral-900 leading-snug tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardDivider({ className }: { className?: string }) {
  return <hr className={cn('border-t border-neutral-100 my-4', className)} />;
}

// ─── StatCard — Premium Stripe-quality stat widget ─────────────
interface StatCardProps {
  label:        string;
  value:        string | number;
  delta?:       string;        // e.g. "+12% vs last week"
  deltaType?:   'up' | 'down' | 'neutral';
  icon?:        ReactNode;
  iconColor?:   string;        // tailwind bg class for icon container
  sublabel?:    string;        // secondary descriptor under label
  className?:   string;
  loading?:     boolean;
}

export function StatCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon,
  iconColor,
  sublabel,
  className,
  loading,
}: StatCardProps) {

  const deltaConfig = {
    up:      { icon: TrendingUp,   color: 'text-success-600', bg: 'bg-success-50' },
    down:    { icon: TrendingDown, color: 'text-danger-600',  bg: 'bg-danger-50'  },
    neutral: { icon: Minus,        color: 'text-neutral-500', bg: 'bg-neutral-100' },
  };
  const dc = deltaConfig[deltaType];

  if (loading) {
    return (
      <Card className={cn('min-h-[100px]', className)}>
        <div className="skeleton h-3 w-24 mb-3" />
        <div className="skeleton h-8 w-16 mb-2" />
        <div className="skeleton h-3 w-20" />
      </Card>
    );
  }

  return (
    <Card className={cn('group', className)}>
      {/* Top row — label + optional icon */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="stat-label">{label}</p>
        {icon && (
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            'text-neutral-500 transition-colors duration-150',
            iconColor ?? 'bg-neutral-100',
          )}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p className="stat-value mb-2">{value}</p>

      {/* Delta or sublabel */}
      {delta ? (
        <div className="flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-normal', dc.bg, dc.color)}>
            <dc.icon size={11} strokeWidth={2.5} />
            {delta}
          </span>
        </div>
      ) : sublabel ? (
        <p className="text-xs text-neutral-400">{sublabel}</p>
      ) : null}
    </Card>
  );
}

// ─── PageContainer ─────────────────────────────────────────────
interface PageContainerProps {
  children:   ReactNode;
  className?: string;
  maxWidth?:  'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidths = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-5xl',
  xl:   'max-w-content',
  full: 'max-w-none',
};

export function PageContainer({ children, className, maxWidth = 'xl' }: PageContainerProps) {
  return (
    <div className={cn('w-full', maxWidths[maxWidth], className)}>
      {children}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────
interface SectionProps {
  title?:     string;
  subtitle?:  string;
  action?:    ReactNode;
  children:   ReactNode;
  className?: string;
}

export function Section({ title, subtitle, action, children, className }: SectionProps) {
  return (
    <section className={cn('', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            {title && (
              <h2 className="text-base font-normal text-neutral-900 tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// ─── InfoRow — key-value pair in detail views ─────────────────
interface InfoRowProps {
  label:      string;
  value:      ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-3 border-b border-neutral-100 last:border-0', className)}>
      <span className="text-sm text-neutral-500 shrink-0 w-36">{label}</span>
      <span className="text-sm text-neutral-900 text-right">{value}</span>
    </div>
  );
}

export default Card;
