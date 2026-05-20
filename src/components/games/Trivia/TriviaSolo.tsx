'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/shared/Button';
import PassPhone from '@/components/shared/PassPhone';
import Confetti from '@/components/shared/Confetti';
import { TriviaDeck } from '@/lib/types';

interface TriviaSoloProps {
  deck: TriviaDeck;
  p1Name: string;
  p2Name: string;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'p1-pick' | 'pass-to-p2' | 'p2-pick' | 'reveal' | 'pass-to-p1' | 'game-over';

const QUESTIONS_PER_GAME = 10;

function shuffleIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export default function TriviaSolo({ deck, p1Name, p2Name, onEnd }: TriviaSoloProps) {
  const [questionOrder] = useState(() =>
    shuffleIndices(deck.questions.length).slice(0, Math.min(QUESTIONS_PER_GAME, deck.questions.length))
  );
  const total = questionOrder.length;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('p1-pick');
  const [p1Pick, setP1Pick] = useState<number | null>(null);
  const [p2Pick, setP2Pick] = useState<number | null>(null);
  const [coupleScore, setCoupleScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionOrder[questionIndex]];

  const handleP1Pick = useCallback((pick: number) => {
    setP1Pick(pick);
    setPhase('pass-to-p2');
  }, []);

  const handlePass = useCallback(() => setPhase('p2-pick'), []);

  const handleP2Pick = useCallback((pick: number) => {
    setP2Pick(pick);
    setPhase('reveal');
  }, []);

  const handleNextRound = useCallback(() => {
    const bothCorrect = p1Pick === question.answer && p2Pick === question.answer;
    const newScore = coupleScore + (bothCorrect ? 1 : 0);

    if (bothCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    const next = questionIndex + 1;
    if (next >= total) {
      setTimeout(() => {
        setCoupleScore(newScore);
        setFinalScore(newScore);
        setPhase('game-over');
      }, 500);
    } else {
      setTimeout(() => {
        setCoupleScore(newScore);
        setQuestionIndex(next);
        setPhase('pass-to-p1');
        setP1Pick(null);
        setP2Pick(null);
      }, 500);
    }
  }, [p1Pick, p2Pick, question.answer, coupleScore, questionIndex, total]);

  const handleQuit = useCallback(() => {
    onEnd(coupleScore, coupleScore);
  }, [coupleScore, onEnd]);

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

  if (phase === 'game-over' && finalScore !== null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={finalScore > 0} />
        <h2 className="font-display text-4xl font-bold text-ink text-center">Game Over!</h2>
        <p className="text-ink-soft text-center max-w-sm">
          {p1Name} &amp; {p2Name} finished with:
        </p>
        <div className="chunky-border-sm bg-bg-peach px-12 py-6 text-center">
          <p className="text-sm text-ink-mute">Couple score</p>
          <p className="font-display text-5xl font-bold text-ink">{finalScore}</p>
          <p className="text-sm text-ink-mute mt-1">out of {total}</p>
        </div>
        {finalScore === total && (
          <p className="font-display text-xl text-ink text-center">Perfect score! You know each other so well!</p>
        )}
        <Button variant="primary" onClick={() => onEnd(finalScore, finalScore)}>
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
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p1Name}&apos;s turn</h2>
        <p className="text-lg text-ink-soft text-center max-w-md">{question.q}</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleP1Pick(i)}
              className="chunky-border bg-bg-warm p-4 text-center font-sans text-ink hover:bg-bg-peach hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'pass-to-p2') {
    return <PassPhone name={p2Name} onContinue={handlePass} fromName={p1Name} />;
  }

  if (phase === 'pass-to-p1') {
    return <PassPhone name={p1Name} onContinue={() => setPhase('p1-pick')} fromName={p2Name} />;
  }

  if (phase === 'p2-pick') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{p2Name}&apos;s turn</h2>
        <p className="text-lg text-ink-soft text-center max-w-md">{question.q}</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleP2Pick(i)}
              className="chunky-border bg-bg-warm p-4 text-center font-sans text-ink hover:bg-bg-peach hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'reveal') {
    const bothCorrect = p1Pick === question.answer && p2Pick === question.answer;
    const currentScore = coupleScore + (bothCorrect ? 1 : 0);

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={showConfetti || bothCorrect} />
        {quitButton}
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
        {counter}
        <p className="text-lg text-ink-soft text-center max-w-md">{question.q}</p>

        <div className="max-w-lg w-full space-y-4">
          <div className={`chunky-border p-4 bg-bg-warm ${p1Pick === question.answer ? 'bg-accent-yellow' : ''}`}>
            <span className="font-display text-sm font-bold text-ink-mute">{p1Name} picked: </span>
            <span className="font-sans text-ink">{question.options[p1Pick ?? 0]}</span>
            <span className="ml-2">{p1Pick === question.answer ? '✅' : '❌'}</span>
          </div>
          <div className={`chunky-border p-4 bg-bg-warm ${p2Pick === question.answer ? 'bg-accent-yellow' : ''}`}>
            <span className="font-display text-sm font-bold text-ink-mute">{p2Name} picked: </span>
            <span className="font-sans text-ink">{question.options[p2Pick ?? 0]}</span>
            <span className="ml-2">{p2Pick === question.answer ? '✅' : '❌'}</span>
          </div>
          <div className="chunky-border p-4 bg-bg-peach">
            <span className="font-display text-sm font-bold text-ink-mute">Correct answer: </span>
            <span className="font-sans font-bold text-ink">{question.options[question.answer]}</span>
          </div>
        </div>

        <p className="font-display text-xl font-bold">
          {bothCorrect ? '🎉 Both got it! +1 point' : '😅 Not this time'}
        </p>

        <div className="text-center">
          <p className="text-sm text-ink-mute">Couple score</p>
          <p className="font-display text-2xl font-bold text-ink">{currentScore} / {total}</p>
        </div>

        <Button variant="primary" onClick={handleNextRound}>
          {questionIndex + 1 >= total ? 'See results' : 'Next question'}
        </Button>
      </div>
    );
  }

  return null;
}
