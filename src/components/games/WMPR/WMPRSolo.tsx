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

type Phase = 'p1-pick' | 'p1-guess' | 'pass-to-p2' | 'p2-pick' | 'p2-guess' | 'pass-to-p1' | 'reveal' | 'game-over';

function generateShuffleSeed(count: number): number[][] {
  return Array.from({ length: count }, () =>
    Math.random() > 0.5 ? [0, 1] : [1, 0]
  );
}

const QUESTIONS_PER_GAME = 10;

function shuffleIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export default function WMPRSolo({ deck, p1Name, p2Name, onEnd }: WMPRSoloProps) {
  const [questionOrder] = useState(() =>
    shuffleIndices(deck.questions.length).slice(0, Math.min(QUESTIONS_PER_GAME, deck.questions.length))
  );
  const total = questionOrder.length;
  const [shuffleSeed] = useState(() => generateShuffleSeed(total));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('p1-pick');
  const [p1Pick, setP1Pick] = useState<number | null>(null);
  const [p1Guess, setP1Guess] = useState<number | null>(null);
  const [p2Pick, setP2Pick] = useState<number | null>(null);
  const [p2Guess, setP2Guess] = useState<number | null>(null);
  const [p1Total, setP1Total] = useState(0);
  const [p2Total, setP2Total] = useState(0);
  const [finalScores, setFinalScores] = useState<{ p1: number; p2: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionOrder[questionIndex]] as [string, string];
  const optionsOrder = shuffleSeed[questionIndex] ?? [0, 1];
  const displayOptions: [string, string] = [question[optionsOrder[0]], question[optionsOrder[1]]];

  const handleP1Pick = useCallback((pick: number) => {
    setP1Pick(pick);
    setPhase('p1-guess');
  }, []);

  const handleP1Guess = useCallback((guess: number) => {
    setP1Guess(guess);
    setPhase('pass-to-p2');
  }, []);

  const handlePassToP2 = useCallback(() => setPhase('p2-pick'), []);

  const handleP2Pick = useCallback((pick: number) => {
    setP2Pick(pick);
    setPhase('p2-guess');
  }, []);

  const handleP2Guess = useCallback((guess: number) => {
    setP2Guess(guess);
    setPhase('pass-to-p1');
  }, []);

  const handlePassToP1 = useCallback(() => setPhase('reveal'), []);

  const handleNextRound = useCallback(() => {
    const s1 = p1Guess === p2Pick ? 1 : 0;
    const s2 = p2Guess === p1Pick ? 1 : 0;
    const newP1 = p1Total + s1;
    const newP2 = p2Total + s2;

    if (s1 + s2 > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    const next = questionIndex + 1;
    if (next >= total) {
      setTimeout(() => {
        setP1Total(newP1);
        setP2Total(newP2);
        setFinalScores({ p1: newP1, p2: newP2 });
        setPhase('game-over');
      }, 500);
    } else {
      setTimeout(() => {
        setP1Total(newP1);
        setP2Total(newP2);
        setQuestionIndex(next);
        setPhase('p1-pick');
        setP1Pick(null);
        setP1Guess(null);
        setP2Pick(null);
        setP2Guess(null);
      }, 500);
    }
  }, [p1Pick, p1Guess, p2Pick, p2Guess, p1Total, p2Total, questionIndex, total]);

  const handleQuit = useCallback(() => {
    onEnd(p1Total, p2Total);
  }, [p1Total, p2Total, onEnd]);

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

  const counter = (
    <p className="text-sm text-ink-mute font-sans">
      Question {questionIndex + 1} of {total}
    </p>
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p1Name}, what would you rather?</h2>
        {renderOptions(handleP1Pick)}
      </div>
    );
  }

  if (phase === 'p1-guess') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        {counter}
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
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p2Name}, what would you rather?</h2>
        {renderOptions(handleP2Pick)}
      </div>
    );
  }

  if (phase === 'p2-guess') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p2Name}, what did {p1Name} pick?</h2>
        {renderOptions(handleP2Guess)}
      </div>
    );
  }

  if (phase === 'pass-to-p1') {
    return <PassPhone name={p1Name} onContinue={handlePassToP1} fromName={p2Name} />;
  }

  if (phase === 'reveal') {
    const p1Correct = p1Guess === p2Pick;
    const p2Correct = p2Guess === p1Pick;

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={showConfetti || p1Correct || p2Correct} />
        {quitButton}
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
        {counter}

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

        <Button variant="primary" onClick={handleNextRound}>
          {questionIndex + 1 >= total ? 'See results' : 'Next round'}
        </Button>
      </div>
    );
  }

  return null;
}
