export type GameId = 'wmpr' | 'hwdykm' | 'trivia';

export type PlayMode = 'solo' | 'cross-device';

export type Player = {
  name: string;
  score: number;
  joinedAt?: number;
};

export type Deck = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  questions: string[][] | TriviaQuestion[] | string[];
};

export type TriviaQuestion = {
  q: string;
  options: string[];
  answer: number;
};

export type WMPRDeck = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  questions: [string, string][];
};

export type HWDYKMDeck = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  questions: string[];
};

export type TriviaDeck = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  questions: TriviaQuestion[];
};

export type WMPRPlayerState = {
  pick: number | null;
  guess: number | null;
};

export type WMPRGameState = {
  phase: 'p1-pick' | 'p1-guess' | 'pass-to-p2' | 'p2-pick' | 'p2-guess' | 'pass-to-p1' | 'p1-guess-p2' | 'reveal';
  questionIndex: number;
  p1: WMPRPlayerState;
  p2: WMPRPlayerState;
};

export type HWDYKMPlayerState = {
  answer: string;
  guess: string;
};

export type HWDYKMGameState = {
  phase: 'p1-answer' | 'pass-to-p2' | 'p2-answer' | 'reveal' | 'scoring';
  questionIndex: number;
  p1: HWDYKMPlayerState;
  p2: HWDYKMPlayerState;
};

export type TriviaPlayerState = {
  pick: number | null;
};

export type TriviaGameState = {
  phase: 'p1-pick' | 'pass-to-p2' | 'p2-pick' | 'reveal';
  questionIndex: number;
  p1: TriviaPlayerState;
  p2: TriviaPlayerState;
};

export type GameState = WMPRGameState | HWDYKMGameState | TriviaGameState;

export type Room = {
  code: string;
  mode: 'cross-device';
  p1: Player | null;
  p2: Player | null;
  screen: 'lobby' | 'arcade' | 'game';
  currentGame: GameId | null;
  currentDeck: string | null;
  gameState: GameState | null;
  createdAt: number;
  expiresAt: number;
};
