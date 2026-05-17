'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent-yellow text-ink hover:shadow-[6px_6px_0px_#2D1B14]',
  secondary: 'bg-bg-peach text-ink hover:shadow-[6px_6px_0px_#2D1B14]',
  accent: 'bg-accent-pink text-ink hover:shadow-[6px_6px_0px_#2D1B14]',
  ghost: 'bg-transparent text-ink-soft hover:bg-bg-peach border-0 shadow-none',
};

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`chunky-border px-6 py-3 font-display text-lg font-bold transition-all duration-200 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
