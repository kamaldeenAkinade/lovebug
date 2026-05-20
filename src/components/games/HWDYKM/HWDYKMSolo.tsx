'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import PassPhone from '@/components/shared/PassPhone';
import Confetti from '@/components/shared/Confetti';
import { HWDYKMDeck } from '@/lib/types';

interface HWDYKMSoloProps {
  deck: HWDYKMDeck;
  p1Name: string;
  p2Name: string;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'p1-answer' | 'pass-to-p2' | 'p2-answer' | 'reveal' | 'pass-to-p1' | 'game-over';

const QUESTIONS_PER_GAME = 10;

function shuffleIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export default function HWDYKMSolo({ deck, p1Name, p2Name, onEnd }: HWDYKMSoloProps) {
  const [questionOrder] = useState(() =>
    shuffleIndices(deck.questions.length).slice(0, Math.min(QUESTIONS_PER_GAME, deck.questions.length))
  );
  const total = questionOrder.length;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('p1-answer');
  const [p1Answer, setP1Answer] = useState('');
  const [p1Guess, setP1Guess] = useState('');
  const [p2Answer, setP2Answer] = useState('');
  const [p2Guess, setP2Guess] = useState('');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [finalScores, setFinalScores] = useState<{ p1: number; p2: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionOrder[questionIndex]];

  const handleP1Submit = useCallback(() => setPhase('pass-to-p2'), []);
  const handlePass = useCallback(() => setPhase('p2-answer'), []);
  const handleP2Submit = useCallback(() => setPhase('reveal'), []);

  const handleNextRound = useCallback(() => {
    const s1 = p1Answer.toLowerCase().trim() === p2Guess.toLowerCase().trim() ? 1 : 0;
    const s2 = p2Answer.toLowerCase().trim() === p1Guess.toLowerCase().trim() ? 1 : 0;
    const newP1 = p1Score + s1;
    const newP2 = p2Score + s2;

    if (s1 + s2 > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    const next = questionIndex + 1;
    if (next >= total) {
      setTimeout(() => {
        setP1Score(newP1);
        setP2Score(newP2);
        setFinalScores({ p1: newP1, p2: newP2 });
        setPhase('game-over');
      }, 500);
    } else {
      setTimeout(() => {
        setP1Score(newP1);
        setP2Score(newP2);
        setQuestionIndex(next);
        setPhase('pass-to-p1');
        setP1Answer('');
        setP1Guess('');
        setP2Answer('');
        setP2Guess('');
      }, 500);
    }
  }, [p1Answer, p1Guess, p2Answer, p2Guess, p1Score, p2Score, questionIndex, total]);

  const handleQuit = useCallback(() => {
    onEnd(p1Score, p2Score);
  }, [p1Score, p2Score, onEnd]);

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

  if (phase === 'p1-answer') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p1Name}</h2>
        <p className="text-lg text-ink-soft text-center">{question}</p>
        <Input
          placeholder="Your answer..."
          value={p1Answer}
          onChange={(e) => setP1Answer(e.target.value)}
          maxLength={100}
        />
        <Input
          placeholder={`Guess ${p2Name}'s answer...`}
          value={p1Guess}
          onChange={(e) => setP1Guess(e.target.value)}
          maxLength={100}
        />
        <Button variant="primary" onClick={handleP1Submit} disabled={!p1Answer.trim() || !p1Guess.trim()}>
          Submit
        </Button>
      </div>
    );
  }

  if (phase === 'pass-to-p2') {
    return <PassPhone name={p2Name} onContinue={handlePass} fromName={p1Name} />;
  }

  if (phase === 'pass-to-p1') {
    return <PassPhone name={p1Name} onContinue={() => setPhase('p1-answer')} fromName={p2Name} />;
  }

  if (phase === 'p2-answer') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p2Name}</h2>
        <p className="text-lg text-ink-soft text-center">{question}</p>
        <Input
          placeholder="Your answer..."
          value={p2Answer}
          onChange={(e) => setP2Answer(e.target.value)}
          maxLength={100}
        />
        <Input
          placeholder={`Guess ${p1Name}'s answer...`}
          value={p2Guess}
          onChange={(e) => setP2Guess(e.target.value)}
          maxLength={100}
        />
        <Button variant="primary" onClick={handleP2Submit} disabled={!p2Answer.trim() || !p2Guess.trim()}>
          Submit
        </Button>
      </div>
    );
  }

  if (phase === 'reveal') {
    const p1Correct = p1Answer.toLowerCase().trim() === p2Guess.toLowerCase().trim();
    const p2Correct = p2Answer.toLowerCase().trim() === p1Guess.toLowerCase().trim();

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={showConfetti || p1Correct || p2Correct} />
        {quitButton}
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
        {counter}
        <p className="text-lg text-ink-soft text-center max-w-md">{question}</p>

        <div className="max-w-lg w-full space-y-4">
          <div className={`chunky-border p-6 bg-bg-warm ${p1Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p1Name} answered</p>
            <p className="font-sans text-lg text-ink">{p1Answer}</p>
            <p className="font-display text-sm font-bold text-ink-mute mt-3 mb-1">{p2Name} guessed</p>
            <p className="font-sans text-lg text-ink">{p2Guess}</p>
            <p className="mt-2 text-sm font-semibold">{p1Correct ? '✅ Matched!' : '❌ Not quite'}</p>
          </div>

          <div className={`chunky-border p-6 bg-bg-warm ${p2Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p2Name} answered</p>
            <p className="font-sans text-lg text-ink">{p2Answer}</p>
            <p className="font-display text-sm font-bold text-ink-mute mt-3 mb-1">{p1Name} guessed</p>
            <p className="font-sans text-lg text-ink">{p1Guess}</p>
            <p className="mt-2 text-sm font-semibold">{p2Correct ? '✅ Matched!' : '❌ Not quite'}</p>
          </div>
        </div>

        <div className="flex gap-8 justify-center">
          <div className="text-center">
            <p className="text-sm text-ink-mute">{p1Name}</p>
            <p className="font-display text-2xl font-bold">{p1Score + (p1Correct ? 1 : 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-ink-mute">{p2Name}</p>
            <p className="font-display text-2xl font-bold">{p2Score + (p2Correct ? 1 : 0)}</p>
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
