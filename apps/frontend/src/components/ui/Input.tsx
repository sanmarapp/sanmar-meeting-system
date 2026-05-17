import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

// ─── Types ─────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  hint?:      string;
  error?:     string;
  prefix?:    ReactNode;   // icon on left
  suffix?:    ReactNode;   // icon or button on right
  fullWidth?: boolean;
}

// ─── Component ─────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, prefix, suffix, fullWidth = true, className, id, ...props },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-normal text-neutral-700 select-none"
          >
            {label}
            {props.required && (
              <span className="text-danger ml-0.5" aria-hidden>*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              'w-full h-9 px-3 text-base font-sans',
              'bg-white text-neutral-900 placeholder:text-neutral-400',
              'border border-neutral-200 rounded-md',
              'transition-all duration-150',
              // Focus
              'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10',
              // Error
              error && 'border-danger/70 focus:border-danger focus:ring-danger/10',
              // Padding adjustments for icons
              prefix && 'pl-9',
              suffix && 'pr-9',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error   ? `${inputId}-error`
              : hint  ? `${inputId}-hint`
              : undefined
            }
            {...props}
          />

          {suffix && (
            <span className="absolute right-3 text-neutral-400 flex items-center">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger flex items-center gap-1">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ─── Textarea variant ──────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?:  string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-normal text-neutral-700">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-base font-sans min-h-[88px] resize-y',
            'bg-white text-neutral-900 placeholder:text-neutral-400',
            'border border-neutral-200 rounded-md',
            'transition-all duration-150',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10',
            error && 'border-danger/70',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export default Input;
