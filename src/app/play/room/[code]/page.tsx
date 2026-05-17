'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import ArcadeDashboard from '@/components/arcade/ArcadeDashboard';
import DeckPicker from '@/components/arcade/DeckPicker';
import WMPRRoom from '@/components/games/WMPR/WMPRRoom';
import { pollRoom, getStoredPlayerRole, updateRoom } from '@/lib/room';
import { Room, GameId, Deck, WMPRDeck } from '@/lib/types';
import { wmprDecks } from '@/content/wmpr';
import { hwdykmDecks } from '@/content/hwdykm';
import { triviaDecks } from '@/content/trivia';

const DECK_MAP: Record<GameId, Deck[]> = {
  wmpr: wmprDecks,
  hwdykm: hwdykmDecks,
  trivia: triviaDecks,
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [myRole, setMyRole] = useState<'p1' | 'p2' | null>(null);
  const [myName, setMyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<'lobby' | 'arcade' | 'deck-picker' | 'game'>('lobby');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [roleReady, setRoleReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    const stored = getStoredPlayerRole();
    if (!stored || stored.code !== code) {
      router.push('/play');
      return;
    }
    startTransition(() => {
      setMyRole(stored.role);
      setMyName(stored.name);
      setRoleReady(true);
    });
  }, [code, router]);

  useEffect(() => {
    if (!code || !roleReady) return;

    const poll = async () => {
      const stopPolling = await pollRoom(code, (updatedRoom) => {
        setRoom(updatedRoom);
        setLoading(false);

        if (updatedRoom.screen === 'arcade') {
          setScreen((prev) => (prev === 'lobby' ? 'arcade' : prev));
        } else if (updatedRoom.screen === 'game' && updatedRoom.currentGame && updatedRoom.currentDeck) {
          const decks = DECK_MAP[updatedRoom.currentGame];
          const deck = decks.find((d) => d.id === updatedRoom.currentDeck) ?? null;
          setSelectedGame(updatedRoom.currentGame);
          setSelectedDeck(deck);
          setScreen('game');
        }
      });
      return stopPolling;
    };

    const stopPromise = poll();
    return () => {
      stopPromise.then((stop) => stop());
    };
  }, [code, roleReady]);

  useEffect(() => {
    startTransition(() => {
      setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
    });
  }, []);

  const handleSelectGame = useCallback((game: GameId) => {
    setSelectedGame(game);
    setSelectedDeck(null);
    setScreen('deck-picker');
  }, []);

  const handleDeckSelect = useCallback((deck: Deck) => {
    setSelectedDeck(deck);
  }, []);

  const handleStartGame = useCallback(async () => {
    if (!room || !selectedGame || !selectedDeck) return;
    setGameKey((k) => k + 1);
    const updatedRoom = JSON.parse(JSON.stringify(room)) as Room;
    updatedRoom.screen = 'game';
    updatedRoom.currentGame = selectedGame;
    updatedRoom.currentDeck = selectedDeck.id;
    await updateRoom(updatedRoom);
    setRoom(updatedRoom);
    setScreen('game');
  }, [room, selectedGame, selectedDeck]);

  const handleGameEnd = useCallback(async (p1Score: number, p2Score: number) => {
    if (!room) return;
    const updatedRoom = JSON.parse(JSON.stringify(room)) as Room;
    updatedRoom.screen = 'arcade';
    updatedRoom.currentGame = null;
    updatedRoom.currentDeck = null;
    if (updatedRoom.p1) updatedRoom.p1.score += p1Score;
    if (updatedRoom.p2) updatedRoom.p2.score += p2Score;
    await updateRoom(updatedRoom);
    setRoom(updatedRoom);
    setScreen('arcade');
  }, [room]);

  const shareLink = room ? `${window.location.origin}/play/room/join?code=${room.code}` : '';

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [shareLink]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lovebug', text: 'Play Lovebug with me!', url: shareLink });
      } catch {}
    } else {
      handleCopyLink();
    }
  }, [shareLink, handleCopyLink]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="font-display text-xl text-ink-mute">Loading room...</p>
      </div>
    );
  }

  if (screen === 'lobby' && room) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6 gap-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-ink mb-2">Your room is ready</h1>
          <p className="text-ink-soft mb-4">Share this link with your partner:</p>
          <div className="chunky-border bg-accent-yellow px-4 py-3 inline-block max-w-sm w-full">
            <input
              readOnly
              value={shareLink}
              className="bg-transparent font-sans text-sm text-center text-ink w-full outline-none"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={handleCopyLink}
              className="chunky-border-sm bg-bg-warm px-4 py-2 font-sans text-sm font-semibold text-ink hover:bg-accent-yellow transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy link'}
            </button>
            {canShare && (
              <button
                onClick={handleShare}
                className="chunky-border-sm bg-bg-warm px-4 py-2 font-sans text-sm font-semibold text-ink hover:bg-accent-yellow transition-colors"
              >
                Share
              </button>
            )}
          </div>
          <p className="mt-6 text-ink-soft text-sm">
            Or share the code: <strong className="text-ink">{room.code}</strong>
          </p>
          <p className="mt-2 text-ink-soft">
            Waiting for {myRole === 'p1' ? 'them' : 'you'}...
          </p>
          {room.p2 && <p className="text-accent-green font-bold mt-2">{room.p2.name} joined!</p>}
        </div>
        {!room.p2 && (
          <div className="animate-pulse">
            <span className="text-4xl">⏳</span>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'arcade' && room && myName) {
    const p1Name = room.p1?.name || 'P1';
    const p2Name = room.p2?.name || 'P2';
    return (
      <div className="flex flex-col min-h-screen">
        <ArcadeDashboard
          p1Name={p1Name}
          p2Name={p2Name}
          scores={{ [p1Name]: room.p1?.score ?? 0, [p2Name]: room.p2?.score ?? 0 }}
          onSelectGame={handleSelectGame}
        />
      </div>
    );
  }

  if (screen === 'deck-picker' && selectedGame) {
    return (
      <div className="flex flex-col min-h-screen">
        <DeckPicker
          deck={selectedDeck}
          decks={DECK_MAP[selectedGame]}
          gameId={selectedGame}
          onSelect={handleDeckSelect}
          onStart={handleStartGame}
        />
        <div className="text-center pb-8">
          <Button variant="ghost" onClick={() => setScreen('arcade')}>
            Back to arcade
          </Button>
        </div>
      </div>
    );
  }

  if (screen === 'game' && room && selectedGame && selectedDeck) {
    if (selectedGame === 'wmpr') {
      return (
        <WMPRRoom
          key={gameKey}
          deck={selectedDeck as WMPRDeck}
          p1Name={room.p1?.name || 'P1'}
          p2Name={room.p2?.name || 'P2'}
          myRole={myRole!}
          room={room}
          onEnd={handleGameEnd}
        />
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ink-soft">This game is not yet available in cross-device mode.</p>
        <Button variant="ghost" onClick={() => setScreen('arcade')}>Back</Button>
      </div>
    );
  }

  return null;
}
