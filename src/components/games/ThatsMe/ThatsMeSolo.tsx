'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/shared/Button';
import PassPhone from '@/components/shared/PassPhone';
import Confetti from '@/components/shared/Confetti';
import { ThatsMeDeck } from '@/lib/types';

interface ThatsMeSoloProps {
  deck: ThatsMeDeck;
  p1Name: string;
  p2Name: string;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'p1-pick' | 'pass-to-p2' | 'p2-pick' | 'reveal' | 'game-over';

const QUESTIONS_PER_GAME = 10;

function shuffleIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function getOutcome(
  p1Pick: 'p1' | 'p2',
  p2Pick: 'p1' | 'p2',
  p1Name: string,
  p2Name: string,
): { message: string; emoji: string; p1Point: boolean; p2Point: boolean } {
  if (p1Pick === 'p1' && p2Pick === 'p1') {
    return { message: `You both agree — ${p1Name}!`, emoji: '✅', p1Point: true, p2Point: false };
  }
  if (p1Pick === 'p2' && p2Pick === 'p2') {
    return { message: `You both agree — ${p2Name}!`, emoji: '✅', p1Point: false, p2Point: true };
  }
  if (p1Pick === 'p1' && p2Pick === 'p2') {
    return { message: 'You both said ME! Settle it!', emoji: '😄', p1Point: false, p2Point: false };
  }
  return { message: "You're each other's biggest fans!", emoji: '💕', p1Point: false, p2Point: false };
}

export default function ThatsMeSolo({ deck, p1Name, p2Name, onEnd }: ThatsMeSoloProps) {
  const [questionOrder] = useState(() =>
    shuffleIndices(deck.questions.length).slice(0, Math.min(QUESTIONS_PER_GAME, deck.questions.length))
  );
  const total = questionOrder.length;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('p1-pick');
  const [p1Pick, setP1Pick] = useState<'p1' | 'p2' | null>(null);
  const [p2Pick, setP2Pick] = useState<'p1' | 'p2' | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [finalScores, setFinalScores] = useState<{ p1: number; p2: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionOrder[questionIndex]];

  const handleP1Pick = useCallback((pick: 'p1' | 'p2') => {
    setP1Pick(pick);
    setPhase('pass-to-p2');
  }, []);

  const handleP2Pick = useCallback((pick: 'p1' | 'p2') => {
    setP2Pick(pick);
    setPhase('reveal');
  }, []);

  const handleNextRound = useCallback(() => {
    if (!p1Pick || !p2Pick) return;
    const { p1Point, p2Point } = getOutcome(p1Pick, p2Pick, p1Name, p2Name);
    const newP1 = p1Score + (p1Point ? 1 : 0);
    const newP2 = p2Score + (p2Point ? 1 : 0);
    setP1Score(newP1);
    setP2Score(newP2);

    if (p1Point || p2Point) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    const next = questionIndex + 1;
    if (next >= total) {
      setTimeout(() => {
        setFinalScores({ p1: newP1, p2: newP2 });
        setPhase('game-over');
      }, 500);
    } else {
      setTimeout(() => {
        setQuestionIndex(next);
        setPhase('p1-pick');
        setP1Pick(null);
        setP2Pick(null);
      }, 500);
    }
  }, [p1Pick, p2Pick, p1Score, p2Score, questionIndex, total, p1Name, p2Name]);

  const handleQuit = useCallback(() => {
    onEnd(p1Score, p2Score);
  }, [p1Score, p2Score, onEnd]);

  const counter = (
    <p className="text-sm text-ink-mute font-sans">Question {questionIndex + 1} of {total}</p>
  );

  const quitButton = (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={handleQuit}
        className="chunky-border-sm bg-bg-coral px-3 py-1 text-sm font-sans text-ink hover:bg-accent-red transition-colors"
      >
        ✕ Quit
      </button>
    </div>
  );

  if (phase === 'game-over' && finalScores) {
    const winner =
      finalScores.p1 > finalScores.p2 ? p1Name
      : finalScores.p2 > finalScores.p1 ? p2Name
      : null;
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active />
        <h2 className="font-display text-4xl font-bold text-ink text-center">Game Over!</h2>
        {winner ? (
          <p className="font-display text-2xl text-ink text-center">{winner} wins!</p>
        ) : (
          <p className="font-display text-2xl text-ink text-center">It&apos;s a tie!</p>
        )}
        <div className="flex gap-8 justify-center">
          <div className="chunky-border-sm bg-bg-peach px-8 py-4 text-center">
            <p className="text-sm text-ink-mute">{p1Name}</p>
            <p className="font-display text-4xl font-bold text-ink">{finalScores.p1}</p>
          </div>
          <div className="chunky-border-sm bg-bg-peach px-8 py-4 text-center">
            <p className="text-sm text-ink-mute">{p2Name}</p>
            <p className="font-display text-4xl font-bold text-ink">{finalScores.p2}</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => onEnd(finalScores.p1, finalScores.p2)}>
          Back to arcade
        </Button>
      </div>
    );
  }

  if (phase === 'p1-pick') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p1Name}</h2>
        <p className="text-xl text-ink-soft text-center font-sans">{question}</p>
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => handleP1Pick('p1')}
            className="chunky-border bg-accent-yellow py-5 text-xl font-display font-bold text-ink hover:scale-105 transition-transform active:scale-95"
          >
            Me
          </button>
          <button
            onClick={() => handleP1Pick('p2')}
            className="chunky-border bg-bg-peach py-5 text-xl font-display font-bold text-ink hover:scale-105 transition-transform active:scale-95"
          >
            {p2Name}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'pass-to-p2') {
    return <PassPhone name={p2Name} onContinue={() => setPhase('p2-pick')} fromName={p1Name} />;
  }

  if (phase === 'p2-pick') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p2Name}</h2>
        <p className="text-xl text-ink-soft text-center font-sans">{question}</p>
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => handleP2Pick('p2')}
            className="chunky-border bg-accent-yellow py-5 text-xl font-display font-bold text-ink hover:scale-105 transition-transform active:scale-95"
          >
            Me
          </button>
          <button
            onClick={() => handleP2Pick('p1')}
            className="chunky-border bg-bg-peach py-5 text-xl font-display font-bold text-ink hover:scale-105 transition-transform active:scale-95"
          >
            {p1Name}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'reveal' && p1Pick && p2Pick) {
    const { message, emoji, p1Point, p2Point } = getOutcome(p1Pick, p2Pick, p1Name, p2Name);
    const agreed = p1Point || p2Point;

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        <Confetti active={showConfetti || agreed} />
        {quitButton}
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
        {counter}
        <p className="text-lg text-ink-soft text-center max-w-md font-sans">{question}</p>

        <div className="flex gap-4 w-full max-w-sm">
          <div className={`flex-1 chunky-border p-5 text-center ${p1Point ? 'bg-accent-yellow' : 'bg-bg-warm'}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-2">{p1Name} said</p>
            <p className="font-display text-lg font-bold text-ink">
              {p1Pick === 'p1' ? p1Name : p2Name}
            </p>
          </div>
          <div className={`flex-1 chunky-border p-5 text-center ${p2Point ? 'bg-accent-yellow' : 'bg-bg-warm'}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-2">{p2Name} said</p>
            <p className="font-display text-lg font-bold text-ink">
              {p2Pick === 'p2' ? p2Name : p1Name}
            </p>
          </div>
        </div>

        <div className="chunky-border-sm bg-bg-peach px-6 py-4 text-center max-w-sm w-full">
          <p className="text-3xl mb-1">{emoji}</p>
          <p className="font-display text-lg font-bold text-ink">{message}</p>
        </div>

        <div className="flex gap-8 justify-center">
          <div className="text-center">
            <p className="text-sm text-ink-mute">{p1Name}</p>
            <p className="font-display text-2xl font-bold">{p1Score + (p1Point ? 1 : 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-ink-mute">{p2Name}</p>
            <p className="font-display text-2xl font-bold">{p2Score + (p2Point ? 1 : 0)}</p>
          </div>
        </div>

        <Button variant="primary" onClick={handleNextRound}>
          {questionIndex + 1 >= total ? 'See results' : 'Next round'}
        </Button>
      </div>
    );
  }

  return null;
}
