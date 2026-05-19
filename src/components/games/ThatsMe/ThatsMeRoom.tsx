'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Button from '@/components/shared/Button';
import Confetti from '@/components/shared/Confetti';
import { ThatsMeDeck, Room } from '@/lib/types';
import { updateRoom, pollRoom, getRoom } from '@/lib/room';

interface ThatsMeRoomProps {
  deck: ThatsMeDeck;
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
  p1Pick: 'p1' | 'p2' | null;
  p2Pick: 'p1' | 'p2' | null;
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

export default function ThatsMeRoom({ deck, p1Name, p2Name, myRole, room, onEnd }: ThatsMeRoomProps) {
  const gameSeed = room.code + (room.currentDeck ?? '');
  const [questionOrder] = useState(() =>
    seededShuffleIndices(deck.questions.length, gameSeed).slice(0, Math.min(QUESTIONS_PER_GAME, deck.questions.length))
  );
  const total = questionOrder.length;

  const [questionIndex, setQuestionIndex] = useState(0);
  const questionIndexRef = useRef(questionIndex);
  questionIndexRef.current = questionIndex;

  const [phase, setPhase] = useState<Phase>('picking');
  const [myPick, setMyPick] = useState<'p1' | 'p2' | null>(null);
  const [p1Pick, setP1Pick] = useState<'p1' | 'p2' | null>(null);
  const [p2Pick, setP2Pick] = useState<'p1' | 'p2' | null>(null);
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
        gs.p1Pick !== null &&
        gs.p2Pick !== null
      ) {
        setP1Pick(gs.p1Pick);
        setP2Pick(gs.p2Pick);
        setPhase('reveal');
        return;
      }

      // Partner advanced to next round
      if (gs.questionIndex > localQI && gs.p1Pick === null && gs.p2Pick === null) {
        setQuestionIndex(gs.questionIndex);
        questionIndexRef.current = gs.questionIndex;
        setPhase('picking');
        setMyPick(null);
        setP1Pick(null);
        setP2Pick(null);
      }
    });

    return () => { stopPolling.then((s) => s()); };
  }, [room.code]);

  const handlePick = useCallback(async (pick: 'p1' | 'p2') => {
    setMyPick(pick);
    setPhase('waiting-for-partner');

    const latestRoom = await getRoom(room.code);
    const base = latestRoom ?? room;
    const updatedRoom = JSON.parse(JSON.stringify(base)) as Room;
    const rawGS = updatedRoom.gameState as RoundGS | null;
    const existingGS = (rawGS?.questionIndex === questionIndex ? rawGS : null) ?? {
      questionIndex,
      p1Pick: null,
      p2Pick: null,
    };

    if (myRole === 'p1') {
      updatedRoom.gameState = {
        questionIndex,
        p1Pick: pick,
        p2Pick: existingGS.p2Pick,
      } as unknown as Room['gameState'];
    } else {
      updatedRoom.gameState = {
        questionIndex,
        p1Pick: existingGS.p1Pick,
        p2Pick: pick,
      } as unknown as Room['gameState'];
    }

    await updateRoom(updatedRoom);
  }, [room, questionIndex, myRole]);

  const handleNextRound = useCallback(async () => {
    if (!p1Pick || !p2Pick) return;
    const { p1Point, p2Point } = getOutcome(p1Pick, p2Pick, p1Name, p2Name);
    const newP1 = p1Total + (p1Point ? 1 : 0);
    const newP2 = p2Total + (p2Point ? 1 : 0);

    if (p1Point || p2Point) {
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
          p1Pick: null,
          p2Pick: null,
        } as unknown as Room['gameState'];
        await updateRoom(updatedRoom);
      }
      return;
    }

    setQuestionIndex(next);
    questionIndexRef.current = next;
    setPhase('picking');
    setMyPick(null);
    setP1Pick(null);
    setP2Pick(null);
    setP1Total(newP1);
    setP2Total(newP2);

    const latestRoom = await getRoom(room.code);
    if (latestRoom) {
      const updatedRoom = JSON.parse(JSON.stringify(latestRoom)) as Room;
      updatedRoom.gameState = {
        questionIndex: next,
        p1Pick: null,
        p2Pick: null,
      } as unknown as Room['gameState'];
      await updateRoom(updatedRoom);
    }
  }, [p1Pick, p2Pick, p1Total, p2Total, questionIndex, total, room.code, p1Name, p2Name]);

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
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{myName}</h2>
        <p className="text-xl text-ink-soft text-center font-sans">{question}</p>
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => handlePick(myRole)}
            className="chunky-border bg-accent-yellow py-5 text-xl font-display font-bold text-ink hover:scale-105 transition-transform active:scale-95"
          >
            Me
          </button>
          <button
            onClick={() => handlePick(myRole === 'p1' ? 'p2' : 'p1')}
            className="chunky-border bg-bg-peach py-5 text-xl font-display font-bold text-ink hover:scale-105 transition-transform active:scale-95"
          >
            {partnerName}
          </button>
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
        <p className="text-ink-soft text-center">
          You picked <strong>{myPick === myRole ? 'yourself' : partnerName}</strong>. Locked in!
        </p>
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
            <p className="font-display text-2xl font-bold">{p1Total + (p1Point ? 1 : 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-ink-mute">{p2Name}</p>
            <p className="font-display text-2xl font-bold">{p2Total + (p2Point ? 1 : 0)}</p>
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
