import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AlertCircle } from 'lucide-react';

// ─── Input ─────────────────────────────────────────────────────
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?:     string;
  hint?:      string;
  error?:     string;
  prefix?:    ReactNode;
  suffix?:    ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, prefix, suffix, fullWidth = true, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>

        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-normal text-neutral-700 select-none leading-none"
          >
            {label}
            {props.required && (
              <span className="text-danger ml-0.5" aria-hidden>*</span>
            )}
          </label>
        )}

        {/* Field wrapper */}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-neutral-400 pointer-events-none flex items-center z-10">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Layout
              'w-full h-[38px] px-3 text-base font-sans',
              // Color
              'bg-white text-neutral-900 placeholder:text-neutral-400',
              // Border
              'border border-neutral-200 rounded-lg',
              // Transition
              'transition-all duration-150',
              // Focus — ring + border color change
              'focus:outline-none focus:border-primary-400',
              'focus:shadow-[0_0_0_3px_rgba(130,107,82,0.12)]',
              // Hover
              'hover:border-neutral-300',
              // Error override
              error && [
                'border-danger-300 hover:border-danger-400',
                'focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]',
              ],
              // Disabled
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-75',
              // Icon padding
              prefix && 'pl-9',
              suffix && 'pr-9',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error  ? `${inputId}-error`
              : hint  ? `${inputId}-hint`
              : undefined
            }
            {...props}
          />

          {suffix && (
            <span className="absolute right-3 text-neutral-400 flex items-center z-10">
              {suffix}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1 text-xs text-danger leading-none"
          >
            <AlertCircle size={11} strokeWidth={2} className="shrink-0" />
            {error}
          </p>
        )}

        {/* Hint */}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-neutral-500 leading-relaxed">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ─── Textarea ──────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?:  string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-normal text-neutral-700 leading-none">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2.5 text-base font-sans min-h-[88px] resize-y',
            'bg-white text-neutral-900 placeholder:text-neutral-400',
            'border border-neutral-200 rounded-lg',
            'transition-all duration-150',
            'hover:border-neutral-300',
            'focus:outline-none focus:border-primary-400',
            'focus:shadow-[0_0_0_3px_rgba(130,107,82,0.12)]',
            error && 'border-danger-300 focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 text-xs text-danger leading-none">
            <AlertCircle size={11} strokeWidth={2} className="shrink-0" />
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-neutral-500 leading-relaxed">{hint}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export default Input;
