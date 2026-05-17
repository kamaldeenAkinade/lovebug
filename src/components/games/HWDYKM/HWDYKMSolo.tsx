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

type Phase = 'p1-answer' | 'pass-to-p2' | 'p2-answer' | 'reveal';

export default function HWDYKMSolo({ deck, p1Name, p2Name, onEnd }: HWDYKMSoloProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('p1-answer');
  const [p1Answer, setP1Answer] = useState('');
  const [p1Guess, setP1Guess] = useState('');
  const [p2Answer, setP2Answer] = useState('');
  const [p2Guess, setP2Guess] = useState('');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionIndex % deck.questions.length];

  const handleP1Submit = useCallback(() => {
    setPhase('pass-to-p2');
  }, []);

  const handlePass = useCallback(() => {
    setPhase('p2-answer');
  }, []);

  const handleP2Submit = useCallback(() => {
    setPhase('reveal');
  }, []);

  const handleNextRound = useCallback(() => {
    const s1 = p1Answer.toLowerCase().trim() === p2Guess.toLowerCase().trim() ? 1 : 0;
    const s2 = p2Answer.toLowerCase().trim() === p1Guess.toLowerCase().trim() ? 1 : 0;
    setP1Score((s) => s + s1);
    setP2Score((s) => s + s2);

    if (s1 + s2 > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      setPhase('p1-answer');
      setP1Answer('');
      setP1Guess('');
      setP2Answer('');
      setP2Guess('');
    }, 500);
  }, [p1Answer, p1Guess, p2Answer, p2Guess]);

  const handleEndGame = useCallback(() => {
    onEnd(p1Score, p2Score);
  }, [p1Score, p2Score, onEnd]);

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

  if (phase === 'p1-answer') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
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

  if (phase === 'p2-answer') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
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
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
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

        <div className="flex gap-4">
          <Button variant="primary" onClick={handleNextRound}>Next round</Button>
          <Button variant="ghost" onClick={handleEndGame}>End game</Button>
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
      </div>
    );
  }

  return null;
}
