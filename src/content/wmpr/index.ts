import { WMPRDeck } from '@/lib/types';
import { sillyDeck } from './silly';
import { hypotheticalDeck } from './hypothetical';
import { hotTakesDeck } from './hottakes';
import { deepCutsDeck } from './deepcuts';

export const wmprDecks: WMPRDeck[] = [
  sillyDeck,
  hypotheticalDeck,
  hotTakesDeck,
  deepCutsDeck,
];

export function getWMPRDeck(id: string): WMPRDeck | undefined {
  return wmprDecks.find((d) => d.id === id);
}
