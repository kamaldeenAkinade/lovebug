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

type Phase = 'p1-pick' | 'pass-to-p2' | 'p2-pick' | 'reveal';

export default function TriviaSolo({ deck, p1Name, p2Name, onEnd }: TriviaSoloProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('p1-pick');
  const [p1Pick, setP1Pick] = useState<number | null>(null);
  const [p2Pick, setP2Pick] = useState<number | null>(null);
  const [roundScore, setRoundScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionIndex % deck.questions.length];

  const handleP1Pick = useCallback((pick: number) => {
    setP1Pick(pick);
    setPhase('pass-to-p2');
  }, []);

  const handlePass = useCallback(() => {
    setPhase('p2-pick');
  }, []);

  const handleP2Pick = useCallback((pick: number) => {
    setP2Pick(pick);
    setPhase('reveal');
  }, []);

  const handleNextRound = useCallback(() => {
    const bothCorrect = p1Pick === question.answer && p2Pick === question.answer;
    const points = bothCorrect ? 1 : 0;
    setRoundScore((s) => s + points);

    if (points > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      setPhase('p1-pick');
      setP1Pick(null);
      setP2Pick(null);
    }, 500);
  }, [p1Pick, p2Pick, question.answer]);

  const handleEndGame = useCallback(() => {
    const bothCorrect = p1Pick === question.answer && p2Pick === question.answer;
    onEnd(roundScore + (bothCorrect ? 1 : 0), roundScore + (bothCorrect ? 1 : 0));
  }, [roundScore, p1Pick, p2Pick, question.answer, onEnd]);

  const currentRoundScore = () => {
    if (p1Pick === null || p2Pick === null) return roundScore;
    return roundScore + (p1Pick === question.answer && p2Pick === question.answer ? 1 : 0);
  };

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

  if (phase === 'p2-pick') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
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

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={showConfetti || bothCorrect} />
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
        <p className="text-lg text-ink-soft text-center max-w-md">{question.q}</p>

        <div className="max-w-lg w-full space-y-4">
          <div className="chunky-border p-4 bg-bg-warm">
            <span className="font-display text-sm font-bold text-ink-mute">{p1Name} picked: </span>
            <span className="font-sans text-ink">{question.options[p1Pick ?? 0]}</span>
          </div>
          <div className="chunky-border p-4 bg-bg-warm">
            <span className="font-display text-sm font-bold text-ink-mute">{p2Name} picked: </span>
            <span className="font-sans text-ink">{question.options[p2Pick ?? 0]}</span>
          </div>
          <div className={`chunky-border p-4 ${bothCorrect ? 'bg-accent-yellow' : 'bg-bg-coral'}`}>
            <span className="font-display text-sm font-bold text-ink-mute">Correct answer: </span>
            <span className="font-sans font-bold text-ink">{question.options[question.answer]}</span>
          </div>
        </div>

        <p className="font-display text-xl font-bold">
          {bothCorrect ? '🎉 Both got it right! +1 point' : '😅 Not this time'}
        </p>

        <div className="flex gap-4">
          <Button variant="primary" onClick={handleNextRound}>Next question</Button>
          <Button variant="ghost" onClick={handleEndGame}>End game</Button>
        </div>

        <div className="text-center">
          <p className="font-display text-2xl font-bold text-ink">
            Couple score: {currentRoundScore()}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
