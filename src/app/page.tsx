import Link from 'next/link';
import GameCard from '@/components/landing/GameCard';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 chunky-border-sm bg-bg-peach mb-0">
        <span className="font-display text-2xl font-bold text-ink">lovebug</span>
        <nav className="flex gap-4">
          <Link href="/about" className="text-ink-soft hover:text-ink font-sans text-sm font-medium transition-colors">
            About
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="flex flex-col items-center text-center px-6 py-20 max-w-2xl mx-auto">
          <span className="font-display text-sm font-semibold text-ink-mute mb-4 inline-block chunky-border-sm px-3 py-1 bg-bg-coral">
            ♥ A silly little arcade for two
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-ink leading-tight mb-6">
            Play your way back to <em className="text-accent-pink not-italic">each other</em>.
          </h1>
          <p className="text-ink-soft text-lg max-w-lg mb-10 leading-relaxed">
            Three quick games. Pick a deck, predict your partner, react and laugh.
            No accounts, no scheduling, no creative pressure. Just a four-letter room code
            and your person, whether they are across the couch or across the country.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/play"
              className="chunky-border bg-accent-yellow px-8 py-4 font-display text-lg font-bold text-ink hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200"
            >
              Start a room
            </Link>
            <Link
              href="/play/room/join"
              className="chunky-border bg-bg-warm px-8 py-4 font-display text-lg font-bold text-ink hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200"
            >
              I have a code
            </Link>
          </div>
        </section>

        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-ink text-center mb-10">
            Three games. Twelve decks. Endless laughs.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <GameCard
              title="Would My Partner Rather"
              tagline="Absurd this-or-thats. Guess what they would pick. Score points for matching their answer."
              time="~5 min"
              decks="4 decks"
              emoji="🤔"
              color="#FFD93D"
              gameId="wmpr"
            />
            <GameCard
              title="That's Me!"
              tagline="Who does it better — you or your partner? Pick yourself and defend it."
              time="~10 min"
              decks="2 decks"
              emoji="🙋"
              color="#FF8FB1"
              gameId="thatisme"
            />
            <GameCard
              title="Couples Trivia"
              tagline="You both answer the same question. You only score if both of you get it right."
              time="~7 min"
              decks="4 decks"
              emoji="🧠"
              color="#A78BFA"
              gameId="trivia"
            />
          </div>
        </section>

        <section className="bg-bg-peach py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-ink mb-6">
              Together on the couch or texting across timezones.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="flex flex-col gap-2">
                <span className="text-3xl">1</span>
                <h3 className="font-display text-lg font-bold text-ink">Pick your mode.</h3>
                <p className="text-ink-soft text-sm">Same phone, passed back and forth. Or two phones, anywhere in the world.</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl">2</span>
                <h3 className="font-display text-lg font-bold text-ink">Pick a game and a deck.</h3>
                <p className="text-ink-soft text-sm">Silly, sweet, thoughtful, or chaotic, you choose the vibe.</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl">3</span>
                <h3 className="font-display text-lg font-bold text-ink">Play, laugh, switch.</h3>
                <p className="text-ink-soft text-sm">Bounce between games whenever the mood shifts. The arcade is always open.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-ink mb-6">
            Most relationship apps want to fix you. We just want to make you laugh.
          </h2>
          <p className="text-ink-soft text-lg leading-relaxed">
            There are journaling apps, therapy apps, and date-night-planning apps.
            They all assume your relationship is a problem to solve. Lovebug doesn&apos;t.
            It assumes you already love each other and just want twenty minutes that
            don&apos;t involve scrolling separate feeds in the same room. Pick a game.
            Hand over the phone. Find each other again.
          </p>
        </section>

        <section className="bg-bg-coral py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-ink mb-6">
              Built for the kind of love that survives Wi-Fi.
            </h2>
            <p className="text-ink-soft text-lg leading-relaxed mb-8">
              Distance is hard. Voice calls run out of things to say. Texting goes quiet.
              Lovebug gives you something to actually do together when the world keeps
              you apart. Open a room, send your partner the four-letter code, and play.
              The same game, at the same time, just on different couches.
            </p>
          </div>
        </section>

        <section className="px-6 py-20 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-ink mb-4">
            Ready to be ridiculous together?
          </h2>
          <p className="text-ink-soft text-lg mb-10">
            Two minutes to set up. Probably an hour before you look up.
          </p>
          <Link
            href="/play"
            className="chunky-border bg-accent-yellow px-10 py-4 font-display text-xl font-bold text-ink hover:shadow-[6px_6px_0px_#2D1B14] transition-all duration-200"
          >
            Start a room
          </Link>
        </section>
      </main>

      <footer className="border-t-3 border-ink bg-bg-warm px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-semibold text-ink-mute">
            Made for the kind of love that survives Wi-Fi.
          </span>
          <div className="flex gap-6 text-sm text-ink-soft">
            <Link href="/about" className="hover:text-ink transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
