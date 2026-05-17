'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Button from '@/components/shared/Button';
import Confetti from '@/components/shared/Confetti';
import { WMPRDeck, Room } from '@/lib/types';
import { updateRoom, pollRoom, getRoom } from '@/lib/room';

interface WMPRRoomProps {
  deck: WMPRDeck;
  p1Name: string;
  p2Name: string;
  myRole: 'p1' | 'p2';
  room: Room;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'pick-and-guess' | 'waiting-for-partner' | 'reveal' | 'game-over';

type RoundGS = {
  questionIndex: number;
  p1: { pick: number | null; guess: number | null };
  p2: { pick: number | null; guess: number | null };
};

function generateShuffleSeed(count: number): number[][] {
  return Array.from({ length: count }, () =>
    Math.random() > 0.5 ? [0, 1] : [1, 0]
  );
}

export default function WMPRRoom({ deck, p1Name, p2Name, myRole, room, onEnd }: WMPRRoomProps) {
  const total = deck.questions.length;
  const [shuffleSeed] = useState(() => generateShuffleSeed(total));
  const [questionIndex, setQuestionIndex] = useState(0);
  const questionIndexRef = useRef(questionIndex);
  questionIndexRef.current = questionIndex;

  const [phase, setPhase] = useState<Phase>('pick-and-guess');
  const [myPick, setMyPick] = useState<number | null>(null);
  const [myGuess, setMyGuess] = useState<number | null>(null);
  const [partnerPick, setPartnerPick] = useState<number | null>(null);
  const [partnerGuess, setPartnerGuess] = useState<number | null>(null);
  const [p1Total, setP1Total] = useState(0);
  const [p2Total, setP2Total] = useState(0);
  const [finalScores, setFinalScores] = useState<{ p1: number; p2: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const question = deck.questions[questionIndex] as [string, string];
  const optionsOrder = shuffleSeed[questionIndex] ?? [0, 1];
  const displayOptions: [string, string] = [question[optionsOrder[0]], question[optionsOrder[1]]];

  const handleQuit = useCallback(async () => {
    const updatedRoom = JSON.parse(JSON.stringify(room)) as Room;
    updatedRoom.screen = 'arcade';
    updatedRoom.currentGame = null;
    updatedRoom.currentDeck = null;
    updatedRoom.gameState = null;
    await updateRoom(updatedRoom);
    onEnd(0, 0);
  }, [room, onEnd]);

  useEffect(() => {
    const stopPolling = pollRoom(room.code, (updatedRoom) => {
      const gs = updatedRoom.gameState as RoundGS | null;
      if (!gs) return;

      const localQI = questionIndexRef.current;

      // Both players submitted — go to reveal
      if (
        gs.questionIndex === localQI &&
        gs.p1.pick !== null && gs.p1.guess !== null &&
        gs.p2.pick !== null && gs.p2.guess !== null
      ) {
        if (myRole === 'p1') {
          setPartnerPick(gs.p2.pick);
          setPartnerGuess(gs.p2.guess);
        } else {
          setPartnerPick(gs.p1.pick);
          setPartnerGuess(gs.p1.guess);
        }
        setPhase('reveal');
        return;
      }

      // Partner advanced to next round (picks are null and questionIndex increased)
      if (gs.questionIndex > localQI && gs.p1.pick === null && gs.p2.pick === null) {
        setQuestionIndex(gs.questionIndex);
        questionIndexRef.current = gs.questionIndex;
        setPhase('pick-and-guess');
        setMyPick(null);
        setMyGuess(null);
        setPartnerPick(null);
        setPartnerGuess(null);
      }
    });

    return () => { stopPolling.then((s) => s()); };
  }, [room.code, myRole]);

  const handleSubmit = useCallback(async (pick: number, guess: number) => {
    setMyPick(pick);
    setMyGuess(guess);
    setPhase('waiting-for-partner');

    // Fetch latest room to avoid clobbering partner's data
    const latestRoom = await getRoom(room.code);
    const base = latestRoom ?? room;
    const updatedRoom = JSON.parse(JSON.stringify(base)) as Room;
    const existingGS = (updatedRoom.gameState as RoundGS | null) ?? {
      questionIndex,
      p1: { pick: null, guess: null },
      p2: { pick: null, guess: null },
    };

    if (myRole === 'p1') {
      updatedRoom.gameState = {
        questionIndex,
        p1: { pick, guess },
        p2: existingGS.p2,
      } as unknown as Room['gameState'];
    } else {
      updatedRoom.gameState = {
        questionIndex,
        p1: existingGS.p1,
        p2: { pick, guess },
      } as unknown as Room['gameState'];
    }

    await updateRoom(updatedRoom);
  }, [room, questionIndex, myRole]);

  const handleNextRound = useCallback(async () => {
    const p1P = myRole === 'p1' ? myPick : partnerPick;
    const p1G = myRole === 'p1' ? myGuess : partnerGuess;
    const p2P = myRole === 'p2' ? myPick : partnerPick;
    const p2G = myRole === 'p2' ? myGuess : partnerGuess;

    const s1 = p1G === p2P ? 1 : 0;
    const s2 = p2G === p1P ? 1 : 0;
    const newP1 = p1Total + s1;
    const newP2 = p2Total + s2;
    setP1Total(newP1);
    setP2Total(newP2);

    if (s1 + s2 > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    const next = questionIndex + 1;

    if (next >= total) {
      setFinalScores({ p1: newP1, p2: newP2 });
      setPhase('game-over');
      return;
    }

    // Advance locally
    setQuestionIndex(next);
    questionIndexRef.current = next;
    setPhase('pick-and-guess');
    setMyPick(null);
    setMyGuess(null);
    setPartnerPick(null);
    setPartnerGuess(null);

    // Sync to DB so partner advances too
    const latestRoom = await getRoom(room.code);
    if (latestRoom) {
      const updatedRoom = JSON.parse(JSON.stringify(latestRoom)) as Room;
      updatedRoom.gameState = {
        questionIndex: next,
        p1: { pick: null, guess: null },
        p2: { pick: null, guess: null },
      } as unknown as Room['gameState'];
      await updateRoom(updatedRoom);
    }
  }, [myRole, myPick, myGuess, partnerPick, partnerGuess, p1Total, p2Total, questionIndex, total, room.code]);

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

  const counter = (
    <p className="text-sm text-ink-mute font-sans">
      Question {questionIndex + 1} of {total}
    </p>
  );

  if (phase === 'game-over' && finalScores) {
    const myScore = myRole === 'p1' ? finalScores.p1 : finalScores.p2;
    const partnerScore = myRole === 'p1' ? finalScores.p2 : finalScores.p1;
    const myName = myRole === 'p1' ? p1Name : p2Name;
    const partnerName = myRole === 'p1' ? p2Name : p1Name;
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
            <p className="text-sm text-ink-mute">{myName}</p>
            <p className="font-display text-4xl font-bold text-ink">{myScore}</p>
          </div>
          <div className="chunky-border-sm bg-bg-peach px-8 py-4 text-center">
            <p className="text-sm text-ink-mute">{partnerName}</p>
            <p className="font-display text-4xl font-bold text-ink">{partnerScore}</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => onEnd(finalScores.p1, finalScores.p2)}>
          Back to arcade
        </Button>
      </div>
    );
  }

  if (phase === 'pick-and-guess') {
    return (
      <>
        {quitButton}
        <PickAndGuessScreen
          question={displayOptions}
          name={myRole === 'p1' ? p1Name : p2Name}
          partnerName={myRole === 'p1' ? p2Name : p1Name}
          counter={counter}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  if (phase === 'waiting-for-partner') {
    const partnerName = myRole === 'p1' ? p2Name : p1Name;
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {quitButton}
        {counter}
        <span className="text-5xl animate-pulse">⏳</span>
        <h2 className="font-display text-2xl font-bold text-ink text-center">
          Waiting for {partnerName}...
        </h2>
        <p className="text-ink-soft text-center">Once they answer, the reveal will appear.</p>
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
        {quitButton}
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
        {counter}

        <div className="max-w-lg w-full space-y-4">
          <div className={`chunky-border p-6 bg-bg-warm ${p1Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p1Name} picked</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p1P ?? 0]}</p>
            <p className="font-display text-sm font-bold text-ink-mute mt-2 mb-1">{p1Name} guessed {p2Name} would pick</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p1G ?? 0]}</p>
            <p className="mt-2 text-sm font-semibold">{p1Correct ? '✅ Correct!' : '❌ Wrong'}</p>
          </div>
          <div className={`chunky-border p-6 bg-bg-warm ${p2Correct ? 'bg-accent-yellow' : ''}`}>
            <p className="font-display text-sm font-bold text-ink-mute mb-1">{p2Name} picked</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p2P ?? 0]}</p>
            <p className="font-display text-sm font-bold text-ink-mute mt-2 mb-1">{p2Name} guessed {p1Name} would pick</p>
            <p className="font-sans text-lg text-ink">{displayOptions[p2G ?? 0]}</p>
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

function PickAndGuessScreen({
  question,
  name,
  partnerName,
  counter,
  onSubmit,
}: {
  question: [string, string];
  name: string;
  partnerName: string;
  counter: React.ReactNode;
  onSubmit: (pick: number, guess: number) => void;
}) {
  const [pick, setPick] = useState<number | null>(null);

  if (pick === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {counter}
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
      {counter}
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
