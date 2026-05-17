'use client';

import { useState, useCallback, useEffect } from 'react';
import Button from '@/components/shared/Button';
import Confetti from '@/components/shared/Confetti';
import { WMPRDeck, Room } from '@/lib/types';
import { updateRoom, pollRoom } from '@/lib/room';

interface WMPRRoomProps {
  deck: WMPRDeck;
  p1Name: string;
  p2Name: string;
  myRole: 'p1' | 'p2';
  room: Room;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'waiting' | 'pick-and-guess' | 'waiting-for-partner' | 'reveal';

function generateShuffleSeed(count: number): number[][] {
  return Array.from({ length: count }, () =>
    Math.random() > 0.5 ? [0, 1] : [1, 0]
  );
}

export default function WMPRRoom({ deck, p1Name, p2Name, myRole, room, onEnd }: WMPRRoomProps) {
  const [shuffleSeed] = useState(() => generateShuffleSeed(deck.questions.length));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('pick-and-guess');
  const [myPick, setMyPick] = useState<number | null>(null);
  const [myGuess, setMyGuess] = useState<number | null>(null);
  const [partnerPick, setPartnerPick] = useState<number | null>(null);
  const [partnerGuess, setPartnerGuess] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleQuit = useCallback(async () => {
    const updatedRoom = JSON.parse(JSON.stringify(room)) as Room;
    updatedRoom.screen = 'arcade';
    updatedRoom.currentGame = null;
    updatedRoom.currentDeck = null;
    updatedRoom.gameState = null;
    await updateRoom(updatedRoom);
    onEnd(0, 0);
  }, [room, onEnd]);

  const question = deck.questions[questionIndex % deck.questions.length] as [string, string];
  const optionsOrder = shuffleSeed[questionIndex % deck.questions.length] ?? [0, 1];

  const displayOptions: [string, string] = [
    question[optionsOrder[0]],
    question[optionsOrder[1]],
  ];

  const submitToRoom = useCallback(async (pick: number, guess: number) => {
    const updatedRoom = JSON.parse(JSON.stringify(room)) as Room;
    if (myRole === 'p1') {
      updatedRoom.gameState = {
        phase: 'waiting-for-p2',
        questionIndex,
        p1: { pick, guess },
        p2: { pick: null, guess: null },
      } as unknown as Room['gameState'];
    } else {
      updatedRoom.gameState = {
        phase: 'waiting-for-p1',
        questionIndex,
        p1: { pick: null, guess: null },
        p2: { pick, guess },
      } as unknown as Room['gameState'];
    }
    await updateRoom(updatedRoom);
  }, [room, questionIndex, myRole]);

  useEffect(() => {
    const stopPolling = pollRoom(room.code, (updatedRoom) => {
      const gs = updatedRoom.gameState as { p1: { pick: number; guess: number }; p2: { pick: number; guess: number } } | null;
      if (!gs) return;

      if (myRole === 'p1') {
        if (gs.p2.pick !== null && gs.p2.guess !== null) {
          setPartnerPick(gs.p2.pick);
          setPartnerGuess(gs.p2.guess);
          setPhase('reveal');
        }
      } else {
        if (gs.p1.pick !== null && gs.p1.guess !== null) {
          setPartnerPick(gs.p1.pick);
          setPartnerGuess(gs.p1.guess);
          setPhase('reveal');
        }
      }
    });

    return () => { stopPolling.then(s => s()); };
  }, [room.code, myRole]);

  const handleSubmit = useCallback(async (pick: number, guess: number) => {
    setMyPick(pick);
    setMyGuess(guess);
    setPhase('waiting-for-partner');
    await submitToRoom(pick, guess);
  }, [submitToRoom]);

  const handleNextRound = useCallback(async () => {
    const p1P = myRole === 'p1' ? myPick : partnerPick;
    const p1G = myRole === 'p1' ? myGuess : partnerGuess;
    const p2P = myRole === 'p2' ? myPick : partnerPick;
    const p2G = myRole === 'p2' ? myGuess : partnerGuess;

    const s1 = p1G === p2P ? 1 : 0;
    const s2 = p2G === p1P ? 1 : 0;

    if (s1 + s2 > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    setQuestionIndex((i) => i + 1);
    setPhase('pick-and-guess');
    setMyPick(null);
    setMyGuess(null);
    setPartnerPick(null);
    setPartnerGuess(null);
  }, [myRole, myPick, myGuess, partnerPick, partnerGuess]);

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

  if (phase === 'pick-and-guess') {
    return (
      <>
        {quitButton}
        <PickAndGuessScreen
          question={displayOptions}
          name={myRole === 'p1' ? p1Name : p2Name}
          partnerName={myRole === 'p1' ? p2Name : p1Name}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  if (phase === 'waiting-for-partner') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {quitButton}
        <span className="text-5xl animate-pulse">⏳</span>
        <h2 className="font-display text-2xl font-bold text-ink text-center">
          Waiting for {myRole === 'p1' ? p2Name : p1Name}...
        </h2>
        <p className="text-ink-soft text-center">Once they answer, the reveal will show up.</p>
      </div>
    );
  }

  if (phase === 'reveal') {
    const p1P = myRole === 'p1' ? myPick : partnerPick;
    const p2P = myRole === 'p2' ? myPick : partnerPick;
    const p1G = myRole === 'p1' ? myGuess : partnerGuess;
    const p2G = myRole === 'p2' ? myGuess : partnerGuess;
    const p1Correct = p1G === p2P;
    const p2Correct = p2G === p1P;

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={showConfetti || p1Correct || p2Correct} />
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>

        <div className="max-w-lg w-full space-y-4">
          <div className={`chunky-border p-6 bg-bg-warm ${p1Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p1Name} picked</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p1P ?? 0]}</p>
            <p className="mt-2 text-sm font-semibold">{p1Correct ? '✅ Correct!' : '❌ Wrong'}</p>
          </div>
          <div className={`chunky-border p-6 bg-bg-warm ${p2Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p2Name} picked</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p2P ?? 0]}</p>
            <p className="mt-2 text-sm font-semibold">{p2Correct ? '✅ Correct!' : '❌ Wrong'}</p>
          </div>
        </div>

        <Button variant="primary" onClick={handleNextRound}>Next round</Button>
      </div>
    );
  }

  return null;
}

function PickAndGuessScreen({
  question,
  name,
  partnerName,
  onSubmit,
}: {
  question: [string, string];
  name: string;
  partnerName: string;
  onSubmit: (pick: number, guess: number) => void;
}) {
  const [pick, setPick] = useState<number | null>(null);

  if (pick === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        <h2 className="font-display text-2xl font-bold text-ink text-center">{name}, what would you rather?</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {question.map((option, i) => (
            <button
              key={i}
              onClick={() => setPick(i)}
              className="chunky-border bg-bg-warm p-6 text-center text-lg font-sans font-medium text-ink hover:bg-bg-peach hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200 min-h-[120px] flex items-center justify-center"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
      <h2 className="font-display text-2xl font-bold text-ink text-center">
        What will {partnerName} pick?
      </h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        {question.map((option, i) => (
          <button
            key={i}
            onClick={() => onSubmit(pick, i)}
            className="chunky-border bg-bg-warm p-6 text-center text-lg font-sans font-medium text-ink hover:bg-bg-peach hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200 min-h-[120px] flex items-center justify-center"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
