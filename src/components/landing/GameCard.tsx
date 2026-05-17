import Card from '@/components/shared/Card';
import Sticker from '@/components/shared/Sticker';
import { GameId } from '@/lib/types';

interface GameCardProps {
  title: string;
  tagline: string;
  time: string;
  decks: string;
  emoji: string;
  color: string;
  gameId: GameId;
}

export default function GameCard({
  title,
  tagline,
  time,
  decks,
  emoji,
  color,
}: GameCardProps) {
  return (
    <Card className="flex flex-col gap-3" accent={color}>
      <div className="flex items-center justify-between">
        <span className="text-4xl">{emoji}</span>
        <Sticker color={color}>{time}</Sticker>
      </div>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <p className="text-ink-soft text-sm leading-snug">{tagline}</p>
      <span className="text-xs text-ink-mute font-semibold">{decks}</span>
    </Card>
  );
}
