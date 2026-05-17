import { cn } from '../../lib/cn';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?:      SpinnerSize;
  className?: string;
  label?:     string; // accessible label
}

const sizes: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border',
  md: 'w-5 h-5 border-2',
  lg: 'w-6 h-6 border-2',
  xl: 'w-8 h-8 border-2',
};

export function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block rounded-full',
        'border-neutral-200 border-t-primary-500',
        'animate-spin',
        sizes[size],
        className,
      )}
    />
  );
}

// ─── Full-page loading overlay ─────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    </div>
  );
}

// ─── Inline centered spinner ───────────────────────────────────
export function CenteredSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner size="md" label={label} />
    </div>
  );
}

export default Spinner;
