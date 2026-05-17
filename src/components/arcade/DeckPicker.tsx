import Button from '@/components/shared/Button';
import DeckBadge from '@/components/shared/DeckBadge';
import { GameId, Deck } from '@/lib/types';

interface DeckPickerProps {
  deck: Deck | null;
  decks: Deck[];
  gameId: GameId;
  onSelect: (deck: Deck) => void;
  onStart: () => void;
}

const GAME_NAMES: Record<GameId, string> = {
  wmpr: 'Would My Partner Rather',
  hwdykm: 'How Well Do You Know Me',
  trivia: 'Couples Trivia',
};

export default function DeckPicker({ deck, decks, gameId, onSelect, onStart }: DeckPickerProps) {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-ink text-center">
        {GAME_NAMES[gameId]}
      </h1>
      <p className="text-ink-soft text-center max-w-md">
        Pick a deck to play with.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        {decks.map((d) => (
          <DeckBadge
            key={d.id}
            deck={d}
            selected={deck?.id === d.id}
            onClick={() => onSelect(d)}
          />
        ))}
      </div>

      <div className="mt-4">
        {deck && (
          <p className="text-ink-soft text-sm text-center mb-4 max-w-sm">
            {deck.description}
          </p>
        )}
        <Button
          variant="primary"
          disabled={!deck}
          onClick={onStart}
        >
          Play {deck ? deck.name : '...'}
        </Button>
      </div>
    </div>
  );
}
