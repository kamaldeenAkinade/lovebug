import { Deck } from '@/lib/types';

interface DeckBadgeProps {
  deck: Deck;
  selected?: boolean;
  onClick?: () => void;
}

export default function DeckBadge({ deck, selected, onClick }: DeckBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`chunky-border-sm flex flex-col items-center gap-1 px-4 py-3 text-center transition-all duration-200 min-w-[120px] ${
        selected
          ? 'bg-accent-yellow scale-105'
          : 'bg-bg-warm hover:bg-bg-peach'
      }`}
      style={{ borderColor: deck.color }}
    >
      <span className="text-2xl">{deck.emoji}</span>
      <span className="font-display text-sm font-bold text-ink">{deck.name}</span>
      <span className="text-xs text-ink-mute">{deck.questions.length} prompts</span>
    </button>
  );
}
