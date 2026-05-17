'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/shared/Button';
import PassPhone from '@/components/shared/PassPhone';
import Confetti from '@/components/shared/Confetti';
import { WMPRDeck } from '@/lib/types';

interface WMPRSoloProps {
  deck: WMPRDeck;
  p1Name: string;
  p2Name: string;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'p1-pick' | 'p1-guess' | 'pass-to-p2' | 'p2-pick' | 'p2-guess' | 'pass-to-p1' | 'p1-guess-p2' | 'reveal';

function generateShuffleSeed(count: number): number[][] {
  return Array.from({ length: count }, () =>
    Math.random() > 0.5 ? [0, 1] : [1, 0]
  );
}

export default function WMPRSolo({ deck, p1Name, p2Name, onEnd }: WMPRSoloProps) {
  const [shuffleSeed] = useState(() => generateShuffleSeed(deck.questions.length));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('p1-pick');
  const [p1Pick, setP1Pick] = useState<number | null>(null);
  const [p1Guess, setP1Guess] = useState<number | null>(null);
  const [p2Pick, setP2Pick] = useState<number | null>(null);
  const [p2Guess, setP2Guess] = useState<number | null>(null);
  const [p1Total, setP1Total] = useState(0);
  const [p2Total, setP2Total] = useState(0);
  const [roundScores, setRoundScores] = useState<{ p1: number; p2: number }[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionIndex % deck.questions.length] as [string, string];
  const optionsOrder = shuffleSeed[questionIndex % deck.questions.length] ?? [0, 1];

  const displayOptions: [string, string] = [
    question[optionsOrder[0]],
    question[optionsOrder[1]],
  ];

  const handleP1Pick = useCallback((pick: number) => {
    setP1Pick(pick);
    setPhase('p1-guess');
  }, []);

  const handleP1Guess = useCallback((guess: number) => {
    setP1Guess(guess);
    setPhase('pass-to-p2');
  }, []);

  const handlePassToP2 = useCallback(() => {
    setPhase('p2-pick');
  }, []);

  const handleP2Pick = useCallback((pick: number) => {
    setP2Pick(pick);
    setPhase('p2-guess');
  }, []);

  const handleP2Guess = useCallback((guess: number) => {
    setP2Guess(guess);
    setPhase('pass-to-p1');
  }, []);

  const handlePassToP1 = useCallback(() => {
    setPhase('p1-guess-p2');
  }, []);

  const handleP1GuessP2 = useCallback((guess: number) => {
    setP1Guess(guess);
    setPhase('reveal');
  }, []);

  const handleNextRound = useCallback(() => {
    const s1 = p1Guess === p2Pick ? 1 : 0;
    const s2 = p2Guess === p1Pick ? 1 : 0;
    setRoundScores((prev) => [...prev, { p1: s1, p2: s2 }]);
    setP1Total((t) => t + s1);
    setP2Total((t) => t + s2);

    if (s1 + s2 > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      setPhase('p1-pick');
      setP1Pick(null);
      setP1Guess(null);
      setP2Pick(null);
      setP2Guess(null);
    }, 500);
  }, [p1Pick, p1Guess, p2Pick, p2Guess]);

  const handleEndGame = useCallback(() => {
    let finalP1 = p1Total;
    let finalP2 = p2Total;
    roundScores.forEach((s) => {
      finalP1 += s.p1;
      finalP2 += s.p2;
    });
    onEnd(finalP1, finalP2);
  }, [p1Total, p2Total, roundScores, onEnd]);

  const renderOptions = (onPick: (i: number) => void, highlight?: number | null) => (
    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
      {displayOptions.map((option, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          className={`chunky-border bg-bg-warm p-6 text-center text-lg font-sans font-medium text-ink hover:bg-bg-peach hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200 min-h-[120px] flex items-center justify-center ${
            highlight === i ? 'bg-accent-yellow shadow-[6px_6px_0px_#2D1B14]' : ''
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const quitButton = (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={handleEndGame}
        className="chunky-border-sm bg-bg-coral px-3 py-1 text-sm font-sans text-ink hover:bg-accent-red transition-colors"
      >
        ✕ Quit
      </button>
    </div>
  );

  if (phase === 'p1-pick') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p1Name}, what would you rather?</h2>
        {renderOptions(handleP1Pick)}
      </div>
    );
  }

  if (phase === 'p1-guess') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p1Name}, what will {p2Name} pick?</h2>
        {renderOptions(handleP1Guess)}
      </div>
    );
  }

  if (phase === 'pass-to-p2') {
    return <PassPhone name={p2Name} onContinue={handlePassToP2} fromName={p1Name} />;
  }

  if (phase === 'p2-pick') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p2Name}, what would you rather?</h2>
        {renderOptions(handleP2Pick)}
      </div>
    );
  }

  if (phase === 'p2-guess') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p2Name}, what did {p1Name} pick?</h2>
        {renderOptions(handleP2Guess)}
      </div>
    );
  }

  if (phase === 'pass-to-p1') {
    return <PassPhone name={p1Name} onContinue={handlePassToP1} fromName={p2Name} />;
  }

  if (phase === 'p1-guess-p2') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p1Name}, what did {p2Name} pick?</h2>
        {renderOptions(handleP1GuessP2)}
      </div>
    );
  }

  if (phase === 'reveal') {
    const p1Correct = p1Guess === p2Pick;
    const p2Correct = p2Guess === p1Pick;

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={showConfetti || p1Correct || p2Correct} />
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>

        <div className="max-w-lg w-full space-y-4">
          <div className={`chunky-border p-6 bg-bg-warm ${p1Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p1Name} picked</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p1Pick ?? 0]}</p>
            <p className="font-display text-sm font-bold text-ink-mute mt-3 mb-1">{p1Name} guessed {p2Name} would pick</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p1Guess ?? 0]}</p>
            <p className="mt-2 text-sm font-semibold">{p1Correct ? '✅ Correct!' : '❌ Wrong'}</p>
          </div>

          <div className={`chunky-border p-6 bg-bg-warm ${p2Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p2Name} picked</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p2Pick ?? 0]}</p>
            <p className="font-display text-sm font-bold text-ink-mute mt-3 mb-1">{p2Name} guessed {p1Name} would pick</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p2Guess ?? 0]}</p>
            <p className="mt-2 text-sm font-semibold">{p2Correct ? '✅ Correct!' : '❌ Wrong'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="primary" onClick={handleNextRound}>Next round</Button>
          <Button variant="ghost" onClick={handleEndGame}>End game</Button>
        </div>

        <div className="flex gap-8 justify-center">
          <div className="text-center">
            <p className="text-sm text-ink-mute">{p1Name}</p>
            <p className="font-display text-2xl font-bold">{p1Total + (p1Correct ? 1 : 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-ink-mute">{p2Name}</p>
            <p className="font-display text-2xl font-bold">{p2Total + (p2Correct ? 1 : 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
