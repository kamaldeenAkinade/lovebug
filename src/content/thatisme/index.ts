import { ThatsMeDeck } from '@/lib/types';
import { everydayDeck } from './everyday';
import { naijaLifeDeck } from './naijalife';

export const thatsmeDecks: ThatsMeDeck[] = [everydayDeck, naijaLifeDeck];

export function getThatsMeDeck(id: string): ThatsMeDeck | undefined {
  return thatsmeDecks.find((d) => d.id === id);
}
