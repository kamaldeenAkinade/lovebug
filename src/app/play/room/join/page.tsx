'use client';

import { useState, useEffect, Suspense, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { joinRoom, storePlayerRole } from '@/lib/room';

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      startTransition(() => setCode(codeParam.toUpperCase().slice(0, 4)));
    }
  }, [searchParams]);

  const handleJoin = async () => {
    if (!code.trim() || !name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const room = await joinRoom(code.trim().toUpperCase(), name.trim());
      if (!room) {
        setError('Room not found or already full.');
        setLoading(false);
        return;
      }
      storePlayerRole(room.code, 'p2', name.trim());
      router.push(`/play/room/${room.code}`);
    } catch {
      setError('Failed to join room. Please check the code and try again.');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6 max-w-sm mx-auto w-full">
      <h1 className="font-display text-3xl font-bold text-ink text-center">Join a room</h1>
      <p className="text-ink-soft text-center">Enter the 4-letter code your partner shared.</p>
      <Input
        label="Room code"
        placeholder="ABCD"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
        maxLength={4}
        className="text-center text-2xl tracking-[0.5em] uppercase"
      />
      <Input
        label="Your name"
        placeholder="Enter name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
      />
      {error && <p className="text-accent-red text-sm">{error}</p>}
      <Button
        variant="primary"
        onClick={handleJoin}
        disabled={!code.trim() || !name.trim() || loading}
        className="w-full"
      >
        {loading ? 'Joining...' : 'Join room'}
      </Button>
    </main>
  );
}

export default function JoinRoomPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 chunky-border-sm bg-bg-peach">
        <Link href="/play" className="font-display text-2xl font-bold text-ink">
          lovebug
        </Link>
      </header>

      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center">
          <p className="font-display text-ink-soft">Loading...</p>
        </main>
      }>
        <JoinForm />
      </Suspense>
    </div>
  );
}
