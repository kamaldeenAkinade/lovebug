import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 chunky-border-sm bg-bg-peach">
        <Link href="/" className="font-display text-2xl font-bold text-ink">
          lovebug
        </Link>
      </header>

      <main className="flex-1 px-6 py-16 max-w-2xl mx-auto">
        <section className="mb-12">
          <h1 className="font-display text-4xl font-bold text-ink mb-6">Why we built this</h1>
          <div className="space-y-4 text-ink-soft text-lg leading-relaxed">
            <p>
              Every couples app on the market wants to fix something. Improve communication.
              Schedule date nights. Track intimacy. They treat your relationship like a
              dashboard with red alerts.
            </p>
            <p>
              Lovebug is the opposite. It assumes you already love each other. It just
              gives you something silly to do together when the conversation runs dry:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Would you rather fight 100 chicken-sized horses or one horse-sized chicken?</li>
              <li>What is your partner&apos;s go-to drink order?</li>
              <li>How many hearts does an octopus have?</li>
            </ul>
            <p>
              Three games. Twelve decks. No accounts. No pressure. Just two people
              laughing at the same screen, whether they are on the same couch or a
              thousand miles apart.
            </p>
            <p>
              Made for the kind of love that survives Wi-Fi.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-ink mb-4">Send feedback</h2>
          <p className="text-ink-soft">
            Something broken? A prompt that landed wrong? A feature you desperately want?
            We read every message.
          </p>
        </section>
      </main>

      <footer className="border-t-3 border-ink bg-bg-warm px-6 py-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-ink-mute">
          Lovebug · A silly little arcade for two
        </div>
      </footer>
    </div>
  );
}
