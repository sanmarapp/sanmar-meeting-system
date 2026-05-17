import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

// ─── Card ──────────────────────────────────────────────────────
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?:   boolean;
}

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({ padding = 'md', hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-xl shadow-xs',
        paddings[padding],
        hover && 'transition-shadow duration-150 hover:shadow-sm cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Card subcomponents ────────────────────────────────────────
interface CardHeaderProps {
  title:      string;
  subtitle?:  string;
  action?:    ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-neutral-900 font-display leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardDivider() {
  return <hr className="border-t border-neutral-100 my-4" />;
}

// ─── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  label:      string;
  value:      string | number;
  delta?:     string;
  deltaType?: 'up' | 'down' | 'neutral' | 'warn';
  className?: string;
}

const deltaColors = {
  up:      'text-success',
  down:    'text-danger',
  neutral: 'text-neutral-500',
  warn:    'text-warning',
};

export function StatCard({ label, value, delta, deltaType = 'neutral', className }: StatCardProps) {
  return (
    <Card className={className}>
      <p className="label-xs mb-2">{label}</p>
      <p className="font-display text-3xl font-semibold text-neutral-900 leading-none">
        {value}
      </p>
      {delta && (
        <p className={cn('text-xs mt-2', deltaColors[deltaType])}>
          {delta}
        </p>
      )}
    </Card>
  );
}

// ─── Page Container ────────────────────────────────────────────
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
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h2 className="font-display text-2xl font-semibold text-neutral-900">{title}</h2>}
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export default Card;
