'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { createRoom, storePlayerRole } from '@/lib/room';

export default function NewRoomPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const room = await createRoom(name.trim());
      storePlayerRole(room.code, 'p1', name.trim());
      router.push(`/play/room/${room.code}`);
    } catch {
      setError('Failed to create room. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 chunky-border-sm bg-bg-peach">
        <Link href="/play" className="font-display text-2xl font-bold text-ink">
          lovebug
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6 max-w-sm mx-auto w-full">
        <h1 className="font-display text-3xl font-bold text-ink text-center">Create a room</h1>
        <p className="text-ink-soft text-center">Enter your name and share the code with your partner.</p>
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
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create room'}
        </Button>
      </main>
    </div>
  );
}
