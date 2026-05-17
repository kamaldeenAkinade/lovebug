import Link from 'next/link';

export default function PlayPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 chunky-border-sm bg-bg-peach">
        <Link href="/" className="font-display text-2xl font-bold text-ink">
          lovebug
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <h1 className="font-display text-4xl font-bold text-ink text-center mb-4">
          How do you want to play?
        </h1>
        <p className="text-ink-soft text-lg text-center mb-12 max-w-md">
          Together on the couch or apart in the world. Both work.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl w-full">
          <Link href="/play/solo" className="chunky-border bg-bg-warm p-8 text-center hover:shadow-[6px_6px_0px_#FFD93D] transition-all duration-200 group">
            <span className="text-5xl block mb-4">📱</span>
            <h2 className="font-display text-2xl font-bold text-ink mb-2">Same Device</h2>
            <p className="text-ink-soft text-sm">
              Pass the phone back and forth. No internet needed beyond loading the site.
            </p>
            <span className="inline-block mt-4 text-sm font-semibold text-accent-pink group-hover:underline">
              Pass and Play →
            </span>
          </Link>

          <Link href="/play/room/new" className="chunky-border bg-bg-warm p-8 text-center hover:shadow-[6px_6px_0px_#A78BFA] transition-all duration-200 group">
            <span className="text-5xl block mb-4">🌐</span>
            <h2 className="font-display text-2xl font-bold text-ink mb-2">Cross Device</h2>
            <p className="text-ink-soft text-sm">
              Two phones, anywhere in the world. Get a room code and share it.
            </p>
            <span className="inline-block mt-4 text-sm font-semibold text-accent-purple group-hover:underline">
              Create or Join Room →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
