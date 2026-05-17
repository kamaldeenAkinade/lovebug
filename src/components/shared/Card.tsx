'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  accent?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  accent,
  onClick,
}: CardProps) {
  const shadowColor = accent ?? '#FFD93D';

  return (
    <div
      onClick={onClick}
      className={`chunky-border bg-bg-warm p-6 ${onClick ? 'cursor-pointer hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200' : ''} ${className}`}
      style={{ boxShadow: `4px 4px 0px ${shadowColor}` }}
    >
      {children}
    </div>
  );
}
