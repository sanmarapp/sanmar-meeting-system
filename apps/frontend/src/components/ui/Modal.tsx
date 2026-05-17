import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

// ─── Types ─────────────────────────────────────────────────────
type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  subtitle?:  string;
  children:   ReactNode;
  footer?:    ReactNode;
  size?:      ModalSize;
  className?: string;
  /** Prevent closing on backdrop click */
  persistent?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// ─── Component ─────────────────────────────────────────────────
export function Modal({
  open, onClose, title, subtitle, children, footer,
  size = 'md', className, persistent = false,
}: ModalProps) {

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open || persistent) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, persistent]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-xl',
          'flex flex-col max-h-[90vh]',
          'animate-slide-in-up',
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-neutral-100">
            <div>
              <h2
                id="modal-title"
                className="font-display text-xl font-semibold text-neutral-900 leading-tight"
              >
                {title}
              </h2>
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
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ─── Confirm modal ─────────────────────────────────────────────
interface ConfirmModalProps {
  open:     boolean;
  onClose:  () => void;
  onConfirm: () => void;
  title:    string;
  message:  string;
  confirmLabel?: string;
  danger?:  boolean;
  loading?: boolean;
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', danger = false, loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title}>
      <p className="text-sm text-neutral-600 leading-relaxed">{message}</p>
      <div className="flex items-center justify-end gap-2.5 mt-6">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default Modal;
