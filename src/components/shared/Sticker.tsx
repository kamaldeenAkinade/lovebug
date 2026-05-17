import { ReactNode } from 'react';

interface StickerProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export default function Sticker({
  children,
  className = '',
  color,
}: StickerProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold font-display ${className}`}
      style={{ backgroundColor: color ?? '#FFE8D6', color: '#2D1B14' }}
    >
      {children}
    </span>
  );
}
