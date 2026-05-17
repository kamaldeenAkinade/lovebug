import { TriviaDeck } from '@/lib/types';
import { weirdTriviaDeck } from './weird';

export const triviaDecks: TriviaDeck[] = [weirdTriviaDeck];

export function getTriviaDeck(id: string): TriviaDeck | undefined {
  return triviaDecks.find((d) => d.id === id);
}
