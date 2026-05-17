import Card from '@/components/shared/Card';
import { GameId } from '@/lib/types';

interface ArcadeDashboardProps {
  p1Name: string;
  p2Name: string;
  scores: Record<string, number>;
  onSelectGame: (game: GameId) => void;
}

const GAMES: { id: GameId; title: string; emoji: string; color: string; tagline: string }[] = [
  {
    id: 'wmpr',
    title: 'Would My Partner Rather',
    emoji: '🤔',
    color: '#FFD93D',
    tagline: 'Guess what they would pick.',
  },
  {
    id: 'hwdykm',
    title: 'How Well Do You Know Me',
    emoji: '💭',
    color: '#FF8FB1',
    tagline: 'Predict their answer.',
  },
  {
    id: 'trivia',
    title: 'Couples Trivia',
    emoji: '🧠',
    color: '#A78BFA',
    tagline: 'Both must be right.',
  },
];

export default function ArcadeDashboard({ p1Name, p2Name, scores, onSelectGame }: ArcadeDashboardProps) {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">Arcade</h1>
        <p className="text-ink-soft">
          {p1Name} & {p2Name}
        </p>
      </div>

      <div className="flex gap-8 text-center">
        <div className="chunky-border-sm bg-bg-peach px-6 py-3 min-w-[100px]">
          <p className="text-sm text-ink-mute font-sans">{p1Name}</p>
          <p className="font-display text-3xl font-bold text-ink">{scores[p1Name] ?? 0}</p>
        </div>
        <div className="chunky-border-sm bg-bg-peach px-6 py-3 min-w-[100px]">
          <p className="text-sm text-ink-mute font-sans">{p2Name}</p>
          <p className="font-display text-3xl font-bold text-ink">{scores[p2Name] ?? 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 w-full max-w-2xl">
        {GAMES.map((game) => (
          <Card
            key={game.id}
            accent={game.color}
            onClick={() => onSelectGame(game.id)}
            className="text-center hover:scale-105 transition-transform"
          >
            <span className="text-3xl block mb-2">{game.emoji}</span>
            <h3 className="font-display text-sm font-bold text-ink">{game.title}</h3>
            <p className="text-xs text-ink-mute mt-1">{game.tagline}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
