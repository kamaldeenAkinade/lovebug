'use client';

import { useState, useCallback } from 'react';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import ArcadeDashboard from '@/components/arcade/ArcadeDashboard';
import DeckPicker from '@/components/arcade/DeckPicker';
import WMPRSolo from '@/components/games/WMPR/WMPRSolo';
import HWDYKMSolo from '@/components/games/HWDYKM/HWDYKMSolo';
import TriviaSolo from '@/components/games/Trivia/TriviaSolo';
import { GameId, Deck, WMPRDeck, HWDYKMDeck, TriviaDeck } from '@/lib/types';
import { wmprDecks } from '@/content/wmpr';
import { hwdykmDecks } from '@/content/hwdykm';
import { triviaDecks } from '@/content/trivia';

type Screen = 'names' | 'arcade' | 'deck-picker' | 'game';

const DECK_MAP: Record<GameId, Deck[]> = {
  wmpr: wmprDecks,
  hwdykm: hwdykmDecks,
  trivia: triviaDecks,
};

export default function SoloPage() {
  const [screen, setScreen] = useState<Screen>('names');
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback(() => {
    if (!p1Name.trim() || !p2Name.trim()) return;
    setScores({ [p1Name.trim()]: 0, [p2Name.trim()]: 0 });
    setScreen('arcade');
  }, [p1Name, p2Name]);

  const handleSelectGame = useCallback((game: GameId) => {
    setSelectedGame(game);
    setSelectedDeck(null);
    setScreen('deck-picker');
  }, []);

  const handleDeckSelect = useCallback((deck: Deck) => {
    setSelectedDeck(deck);
  }, []);

  const handleStartGame = useCallback(() => {
    setGameKey((k) => k + 1);
    setScreen('game');
  }, []);

  const handleGameEnd = useCallback((p1Score: number, p2Score: number) => {
    setScores((prev) => ({
      ...prev,
      [p1Name]: prev[p1Name] + p1Score,
      [p2Name]: prev[p2Name] + p2Score,
    }));
    setScreen('arcade');
  }, [p1Name, p2Name]);

  const handleBackToArcade = useCallback(() => {
    setScreen('arcade');
  }, []);

  if (screen === 'names') {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 max-w-sm mx-auto w-full">
          <h1 className="font-display text-3xl font-bold text-ink text-center">
            Who&apos;s playing?
          </h1>
          <div className="w-full flex flex-col gap-4">
            <Input
              label="Player 1"
              placeholder="Enter name..."
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              maxLength={20}
            />
            <Input
              label="Player 2"
              placeholder="Enter name..."
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              maxLength={20}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleStart}
            disabled={!p1Name.trim() || !p2Name.trim()}
            className="w-full"
          >
            Let&apos;s go!
          </Button>
        </div>
      </div>
    );
  }

  if (screen === 'arcade') {
    return (
      <div className="flex flex-col min-h-screen">
        <ArcadeDashboard
          p1Name={p1Name}
          p2Name={p2Name}
          scores={scores}
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
          <Button variant="ghost" onClick={handleBackToArcade}>
            Back to arcade
          </Button>
        </div>
      </div>
    );
  }

  if (screen === 'game' && selectedGame === 'wmpr' && selectedDeck) {
    const wmprDeck = selectedDeck as WMPRDeck;
    return (
      <div className="flex flex-col min-h-screen">
        <WMPRSolo key={gameKey} deck={wmprDeck} p1Name={p1Name} p2Name={p2Name} onEnd={handleGameEnd} />
      </div>
    );
  }

  if (screen === 'game' && selectedGame === 'hwdykm' && selectedDeck) {
    const hwdykmDeck = selectedDeck as HWDYKMDeck;
    return (
      <div className="flex flex-col min-h-screen">
        <HWDYKMSolo key={gameKey} deck={hwdykmDeck} p1Name={p1Name} p2Name={p2Name} onEnd={handleGameEnd} />
      </div>
    );
  }

  if (screen === 'game' && selectedGame === 'trivia' && selectedDeck) {
    const triviaDeck = selectedDeck as TriviaDeck;
    return (
      <div className="flex flex-col min-h-screen">
        <TriviaSolo key={gameKey} deck={triviaDeck} p1Name={p1Name} p2Name={p2Name} onEnd={handleGameEnd} />
      </div>
    );
  }

  return null;
}
