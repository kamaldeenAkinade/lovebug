'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Button from '@/components/shared/Button';
import Confetti from '@/components/shared/Confetti';
import { TriviaDeck, Room } from '@/lib/types';
import { updateRoom, pollRoom, getRoom } from '@/lib/room';

interface TriviaRoomProps {
  deck: TriviaDeck;
  p1Name: string;
  p2Name: string;
  myRole: 'p1' | 'p2';
  room: Room;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'picking' | 'waiting-for-partner' | 'reveal' | 'game-over';

type RoundGS = {
  done?: boolean;
  p1Score?: number;
  p2Score?: number;
  questionIndex: number;
  p1: { pick: number | null };
  p2: { pick: number | null };
};

const QUESTIONS_PER_GAME = 10;

function seededRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => { h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) | 0; return ((h >>> 0) / 0x100000000); };
}

function seededShuffleIndices(count: number, seed: string): number[] {
  const rng = seededRng(seed);
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export default function TriviaRoom({ deck, p1Name, p2Name, myRole, room, onEnd }: TriviaRoomProps) {
  const gameSeed = room.code + (room.currentDeck ?? '');
  const [questionOrder] = useState(() =>
    seededShuffleIndices(deck.questions.length, gameSeed).slice(0, Math.min(QUESTIONS_PER_GAME, deck.questions.length))
  );
  const total = questionOrder.length;

  const [questionIndex, setQuestionIndex] = useState(0);
  const questionIndexRef = useRef(questionIndex);
  questionIndexRef.current = questionIndex;

  const [phase, setPhase] = useState<Phase>('picking');
  const [myPick, setMyPick] = useState<number | null>(null);
  const [partnerPick, setPartnerPick] = useState<number | null>(null);
  const [p1Total, setP1Total] = useState(0);
  const [p2Total, setP2Total] = useState(0);
  const [finalScores, setFinalScores] = useState<{ p1: number; p2: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const phaseRef = useRef<Phase>('picking');
  phaseRef.current = phase;

  const question = deck.questions[questionOrder[questionIndex]];
  const myName = myRole === 'p1' ? p1Name : p2Name;
  const partnerName = myRole === 'p1' ? p2Name : p1Name;

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
      if (phaseRef.current === 'game-over') return;

      if (gs.done) {
        phaseRef.current = 'game-over';
        setFinalScores({ p1: gs.p1Score ?? 0, p2: gs.p2Score ?? 0 });
        setPhase('game-over');
        return;
      }

      const localQI = questionIndexRef.current;

      // Both picked — go to reveal
      if (
        gs.questionIndex === localQI &&
        gs.p1.pick !== null &&
        gs.p2.pick !== null
      ) {
        setPartnerPick(myRole === 'p1' ? gs.p2.pick : gs.p1.pick);
        setPhase('reveal');
        return;
      }

      // Partner advanced to next round
      if (gs.questionIndex > localQI && gs.p1.pick === null && gs.p2.pick === null) {
        setQuestionIndex(gs.questionIndex);
        questionIndexRef.current = gs.questionIndex;
        setPhase('picking');
        setMyPick(null);
        setPartnerPick(null);
      }
    });

    return () => { stopPolling.then((s) => s()); };
  }, [room.code, myRole]);

  const handlePick = useCallback(async (pick: number) => {
    setMyPick(pick);
    setPhase('waiting-for-partner');

    const latestRoom = await getRoom(room.code);
    const base = latestRoom ?? room;
    const updatedRoom = JSON.parse(JSON.stringify(base)) as Room;
    const rawGS = updatedRoom.gameState as RoundGS | null;
    const existingGS = (rawGS?.questionIndex === questionIndex ? rawGS : null) ?? {
      questionIndex,
      p1: { pick: null },
      p2: { pick: null },
    };

    if (myRole === 'p1') {
      updatedRoom.gameState = {
        questionIndex,
        p1: { pick },
        p2: existingGS.p2,
      } as unknown as Room['gameState'];
    } else {
      updatedRoom.gameState = {
        questionIndex,
        p1: existingGS.p1,
        p2: { pick },
      } as unknown as Room['gameState'];
    }

    await updateRoom(updatedRoom);
  }, [room, questionIndex, myRole]);

  const handleNextRound = useCallback(async () => {
    const p1Pick = myRole === 'p1' ? myPick : partnerPick;
    const p2Pick = myRole === 'p2' ? myPick : partnerPick;
    const s1 = p1Pick === question.answer ? 1 : 0;
    const s2 = p2Pick === question.answer ? 1 : 0;
    const newP1 = p1Total + s1;
    const newP2 = p2Total + s2;

    if (s1 + s2 > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    const next = questionIndex + 1;
    if (next >= total) {
      phaseRef.current = 'game-over';
      setP1Total(newP1);
      setP2Total(newP2);
      setFinalScores({ p1: newP1, p2: newP2 });
      setPhase('game-over');
      const latestRoom = await getRoom(room.code);
      if (latestRoom) {
        const updatedRoom = JSON.parse(JSON.stringify(latestRoom)) as Room;
        updatedRoom.gameState = {
          done: true,
          p1Score: newP1,
          p2Score: newP2,
          questionIndex,
          p1: { pick: null },
          p2: { pick: null },
        } as unknown as Room['gameState'];
        await updateRoom(updatedRoom);
      }
      return;
    }

    setQuestionIndex(next);
    questionIndexRef.current = next;
    setPhase('picking');
    setMyPick(null);
    setPartnerPick(null);
    setP1Total(newP1);
    setP2Total(newP2);

    const latestRoom = await getRoom(room.code);
    if (latestRoom) {
      const updatedRoom = JSON.parse(JSON.stringify(latestRoom)) as Room;
      updatedRoom.gameState = {
        questionIndex: next,
        p1: { pick: null },
        p2: { pick: null },
      } as unknown as Room['gameState'];
      await updateRoom(updatedRoom);
    }
  }, [myRole, myPick, partnerPick, p1Total, p2Total, questionIndex, total, question.answer, room.code]);

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

  if (phase === 'picking') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{myName}&apos;s turn</h2>
        <p className="text-lg text-ink-soft text-center max-w-md">{question.q}</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handlePick(i)}
              className="chunky-border bg-bg-warm p-4 text-center font-sans text-ink hover:bg-bg-peach hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'waiting-for-partner') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {quitButton}
        {counter}
        <span className="text-5xl animate-pulse">⏳</span>
        <h2 className="font-display text-2xl font-bold text-ink text-center">
          Waiting for {partnerName}...
        </h2>
        <p className="text-ink-soft text-center">Your answer is locked in.</p>
      </div>
    );
  }

  if (phase === 'reveal') {
    const p1Pick = myRole === 'p1' ? myPick : partnerPick;
    const p2Pick = myRole === 'p2' ? myPick : partnerPick;
    const p1Correct = p1Pick === question.answer;
    const p2Correct = p2Pick === question.answer;

    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up">
        <Confetti active={showConfetti || (p1Correct && p2Correct)} />
        {quitButton}
        <h2 className="font-display text-3xl font-bold text-ink text-center">Reveal!</h2>
        {counter}
        <p className="text-lg text-ink-soft text-center max-w-md">{question.q}</p>

        <div className="max-w-lg w-full space-y-3">
          <div className={`chunky-border p-4 bg-bg-warm ${p1Correct ? 'bg-accent-yellow' : ''}`}>
            <span className="font-display text-sm font-bold text-ink-mute">{p1Name}: </span>
            <span className="font-sans text-ink">{question.options[p1Pick ?? 0]}</span>
            <span className="ml-2">{p1Correct ? '✅' : '❌'}</span>
          </div>
          <div className={`chunky-border p-4 bg-bg-warm ${p2Correct ? 'bg-accent-yellow' : ''}`}>
            <span className="font-display text-sm font-bold text-ink-mute">{p2Name}: </span>
            <span className="font-sans text-ink">{question.options[p2Pick ?? 0]}</span>
            <span className="ml-2">{p2Correct ? '✅' : '❌'}</span>
          </div>
          <div className="chunky-border p-4 bg-bg-peach">
            <span className="font-display text-sm font-bold text-ink-mute">Correct answer: </span>
            <span className="font-sans font-bold text-ink">{question.options[question.answer]}</span>
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
          {questionIndex + 1 >= total ? 'See results' : 'Next question'}
        </Button>
      </div>
    );
  }

  return null;
}
