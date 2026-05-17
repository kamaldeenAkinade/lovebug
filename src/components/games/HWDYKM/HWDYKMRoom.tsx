'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import Confetti from '@/components/shared/Confetti';
import { HWDYKMDeck, Room } from '@/lib/types';
import { updateRoom, pollRoom, getRoom } from '@/lib/room';

interface HWDYKMRoomProps {
  deck: HWDYKMDeck;
  p1Name: string;
  p2Name: string;
  myRole: 'p1' | 'p2';
  room: Room;
  onEnd: (p1Score: number, p2Score: number) => void;
}

type Phase = 'answering' | 'waiting-for-partner' | 'reveal' | 'game-over';

type RoundGS = {
  done?: boolean;
  p1Score?: number;
  p2Score?: number;
  questionIndex: number;
  p1: { answer: string | null; guess: string | null };
  p2: { answer: string | null; guess: string | null };
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

export default function HWDYKMRoom({ deck, p1Name, p2Name, myRole, room, onEnd }: HWDYKMRoomProps) {
  const gameSeed = room.code + (room.currentDeck ?? '');
  const [questionOrder] = useState(() =>
    seededShuffleIndices(deck.questions.length, gameSeed).slice(0, Math.min(QUESTIONS_PER_GAME, deck.questions.length))
  );
  const total = questionOrder.length;

  const [questionIndex, setQuestionIndex] = useState(0);
  const questionIndexRef = useRef(questionIndex);
  questionIndexRef.current = questionIndex;

  const [phase, setPhase] = useState<Phase>('answering');
  const [myAnswer, setMyAnswer] = useState('');
  const [myGuess, setMyGuess] = useState('');
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);
  const [partnerGuess, setPartnerGuess] = useState<string | null>(null);
  const [p1Total, setP1Total] = useState(0);
  const [p2Total, setP2Total] = useState(0);
  const [finalScores, setFinalScores] = useState<{ p1: number; p2: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const phaseRef = useRef<Phase>('answering');
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

      // Both submitted — go to reveal
      if (
        gs.questionIndex === localQI &&
        gs.p1.answer !== null && gs.p1.guess !== null &&
        gs.p2.answer !== null && gs.p2.guess !== null
      ) {
        if (myRole === 'p1') {
          setPartnerAnswer(gs.p2.answer);
          setPartnerGuess(gs.p2.guess);
        } else {
          setPartnerAnswer(gs.p1.answer);
          setPartnerGuess(gs.p1.guess);
        }
        setPhase('reveal');
        return;
      }

      // Partner advanced to next round
      if (gs.questionIndex > localQI && gs.p1.answer === null && gs.p2.answer === null) {
        setQuestionIndex(gs.questionIndex);
        questionIndexRef.current = gs.questionIndex;
        setPhase('answering');
        setMyAnswer('');
        setMyGuess('');
        setPartnerAnswer(null);
        setPartnerGuess(null);
      }
    });

    return () => { stopPolling.then((s) => s()); };
  }, [room.code, myRole]);

  const handleSubmit = useCallback(async () => {
    if (!myAnswer.trim() || !myGuess.trim()) return;
    setPhase('waiting-for-partner');

    const latestRoom = await getRoom(room.code);
    const base = latestRoom ?? room;
    const updatedRoom = JSON.parse(JSON.stringify(base)) as Room;
    const rawGS = updatedRoom.gameState as RoundGS | null;
    const existingGS = (rawGS?.questionIndex === questionIndex ? rawGS : null) ?? {
      questionIndex,
      p1: { answer: null, guess: null },
      p2: { answer: null, guess: null },
    };

    if (myRole === 'p1') {
      updatedRoom.gameState = {
        questionIndex,
        p1: { answer: myAnswer.trim(), guess: myGuess.trim() },
        p2: existingGS.p2,
      } as unknown as Room['gameState'];
    } else {
      updatedRoom.gameState = {
        questionIndex,
        p1: existingGS.p1,
        p2: { answer: myAnswer.trim(), guess: myGuess.trim() },
      } as unknown as Room['gameState'];
    }

    await updateRoom(updatedRoom);
  }, [myAnswer, myGuess, room, questionIndex, myRole]);

  const handleNextRound = useCallback(async () => {
    // p1Correct: P2 correctly guessed P1's answer → P1 scores
    // p2Correct: P1 correctly guessed P2's answer → P2 scores
    const p1Answer = myRole === 'p1' ? myAnswer.trim() : (partnerAnswer ?? '');
    const p2Answer = myRole === 'p2' ? myAnswer.trim() : (partnerAnswer ?? '');
    const p1Guess = myRole === 'p1' ? myGuess.trim() : (partnerGuess ?? '');
    const p2Guess = myRole === 'p2' ? myGuess.trim() : (partnerGuess ?? '');

    const p1Correct = p1Answer.toLowerCase() === p2Guess.toLowerCase();
    const p2Correct = p2Answer.toLowerCase() === p1Guess.toLowerCase();
    const s1 = p1Correct ? 1 : 0;
    const s2 = p2Correct ? 1 : 0;
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
          p1: { answer: null, guess: null },
          p2: { answer: null, guess: null },
        } as unknown as Room['gameState'];
        await updateRoom(updatedRoom);
      }
      return;
    }

    // Advance locally
    setQuestionIndex(next);
    questionIndexRef.current = next;
    setPhase('answering');
    setMyAnswer('');
    setMyGuess('');
    setPartnerAnswer(null);
    setPartnerGuess(null);
    setP1Total(newP1);
    setP2Total(newP2);

    // Sync to DB so partner advances
    const latestRoom = await getRoom(room.code);
    if (latestRoom) {
      const updatedRoom = JSON.parse(JSON.stringify(latestRoom)) as Room;
      updatedRoom.gameState = {
        questionIndex: next,
        p1: { answer: null, guess: null },
        p2: { answer: null, guess: null },
      } as unknown as Room['gameState'];
      await updateRoom(updatedRoom);
    }
  }, [myRole, myAnswer, myGuess, partnerAnswer, partnerGuess, p1Total, p2Total, questionIndex, total, room.code]);

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

  if (phase === 'answering') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 animate-float-up max-w-md mx-auto w-full">
        {quitButton}
        {counter}
        <h2 className="font-display text-2xl font-bold text-ink text-center">{myName}</h2>
        <p className="text-lg text-ink-soft text-center">{question}</p>
        <Input
          label="Your answer"
          placeholder="What's your answer?"
          value={myAnswer}
          onChange={(e) => setMyAnswer(e.target.value)}
          maxLength={100}
        />
        <Input
          label={`Guess ${partnerName}'s answer`}
          placeholder={`What will ${partnerName} say?`}
          value={myGuess}
          onChange={(e) => setMyGuess(e.target.value)}
          maxLength={100}
        />
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!myAnswer.trim() || !myGuess.trim()}
        >
          Submit
        </Button>
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
        <p className="text-ink-soft text-center">Your answers are locked in. Sit tight.</p>
      </div>
    );
  }

  if (phase === 'reveal') {
    const p1Answer = myRole === 'p1' ? myAnswer.trim() : (partnerAnswer ?? '');
    const p2Answer = myRole === 'p2' ? myAnswer.trim() : (partnerAnswer ?? '');
    const p1Guess = myRole === 'p1' ? myGuess.trim() : (partnerGuess ?? '');
    const p2Guess = myRole === 'p2' ? myGuess.trim() : (partnerGuess ?? '');
    const p1Correct = p1Answer.toLowerCase() === p2Guess.toLowerCase();
    const p2Correct = p2Answer.toLowerCase() === p1Guess.toLowerCase();

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
