import { HWDYKMDeck } from '@/lib/types';
import { everydayDeck } from './everyday';
import { naijaLifeDeck } from './naijalife';

export const hwdykmDecks: HWDYKMDeck[] = [everydayDeck, naijaLifeDeck];

export function getHWDYKMDeck(id: string): HWDYKMDeck | undefined {
  return hwdykmDecks.find((d) => d.id === id);
}
