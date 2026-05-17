import { HWDYKMDeck } from '@/lib/types';
import { everydayDeck } from './everyday';

export const hwdykmDecks: HWDYKMDeck[] = [everydayDeck];

export function getHWDYKMDeck(id: string): HWDYKMDeck | undefined {
  return hwdykmDecks.find((d) => d.id === id);
}
