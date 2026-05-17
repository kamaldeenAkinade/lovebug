import { TriviaDeck } from '@/lib/types';
import { weirdTriviaDeck } from './weird';
import { naijaTriviaDeck } from './naija';

export const triviaDecks: TriviaDeck[] = [weirdTriviaDeck, naijaTriviaDeck];

export function getTriviaDeck(id: string): TriviaDeck | undefined {
  return triviaDecks.find((d) => d.id === id);
}
