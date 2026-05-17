import { cn } from '../../lib/cn';

// ─── Base skeleton ─────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  width?:  string;
  height?: string;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded', className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// ─── Text line skeleton ────────────────────────────────────────
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5 rounded"
          width={i === lines - 1 && lines > 1 ? '65%' : '100%'}
        />
      ))}
    </div>
  );
}

// ─── Card skeleton ─────────────────────────────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-white border border-neutral-200 rounded-xl p-5 shadow-xs', className)}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

// ─── Stat card skeleton ────────────────────────────────────────
export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-white border border-neutral-200 rounded-xl p-5 shadow-xs', className)}
      aria-hidden="true"
    >
      <Skeleton className="h-3 w-28 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

// ─── Table row skeleton ────────────────────────────────────────
export function SkeletonTableRow() {
  return (
    <tr aria-hidden="true">
      {[80, 55, 65, 45, 30].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-3.5 rounded" width={`${w}%`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </>
  );
}

// ─── List item skeleton ────────────────────────────────────────
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-3 py-3 border-b border-neutral-100', className)}
      aria-hidden="true"
    >
      <Skeleton className="w-2 h-2 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

export default Skeleton;
