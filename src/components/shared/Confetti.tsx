'use client';

import { useEffect, useState, startTransition } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  round: boolean;
}

const COLORS = ['#FFD93D', '#FF6B6B', '#FF8FB1', '#A78BFA', '#6BCB77', '#FFE8D6'];

function createParticles(): Particle[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.8,
    round: Math.random() > 0.5,
  }));
}

export default function Confetti({ active = false }: { active?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles = createParticles();
      startTransition(() => setParticles(newParticles));
      const timeout = setTimeout(() => {
        startTransition(() => setParticles([]));
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      startTransition(() => setParticles([]));
    }
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '12px',
            height: '12px',
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            borderRadius: p.round ? '50%' : '2px',
            animation: 'confetti-fall 2s ease-out forwards',
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-up {
          animation: float-up 200ms ease-out;
        }
      `}</style>
    </div>
  );
}
