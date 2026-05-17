import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

// ─── Types ─────────────────────────────────────────────────────
type DrawerSide = 'right' | 'left';
type DrawerWidth = 'sm' | 'md' | 'lg';

interface DrawerProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  subtitle?:  string;
  children:   ReactNode;
  footer?:    ReactNode;
  side?:      DrawerSide;
  width?:     DrawerWidth;
  className?: string;
}

const widthClasses: Record<DrawerWidth, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
};

// ─── Component ─────────────────────────────────────────────────
export function Drawer({
  open, onClose, title, subtitle, children, footer,
  side = 'right', width = 'md', className,
}: DrawerProps) {

  // Lock scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/35 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute top-0 bottom-0 flex flex-col bg-white shadow-xl',
          'animate-slide-in-right',
          side === 'right' ? 'right-0' : 'left-0',
          widthClasses[width],
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-neutral-100 shrink-0">
          <div>
            {title && (
              <h2 className="font-display text-xl font-semibold text-neutral-900 leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default Drawer;
