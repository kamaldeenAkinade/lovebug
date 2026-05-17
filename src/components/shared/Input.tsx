'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="font-display text-sm font-semibold text-ink-soft">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`chunky-border bg-bg-warm px-4 py-3 font-sans text-lg text-ink placeholder:text-ink-mute focus:shadow-[6px_6px_0px_#2D1B14] focus:outline-none transition-all duration-200 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
