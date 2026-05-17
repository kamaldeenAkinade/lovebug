import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 chunky-border-sm bg-bg-peach">
        <Link href="/" className="font-display text-2xl font-bold text-ink">
          lovebug
        </Link>
      </header>

      <main className="flex-1 px-6 py-16 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-ink mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-ink-soft text-lg leading-relaxed">
          <p>
            Lovebug is built for private, intimate moments between two people.
            We take that seriously.
          </p>
          <h2 className="font-display text-xl font-bold text-ink mt-8">What we collect</h2>
          <p>
            Almost nothing. In same-device mode, nothing is sent to any server at all.
            Everything stays in your browser.
          </p>
          <p>
            In cross-device mode, we temporarily store room state (player names, scores,
            answers) so both devices can sync. This data is automatically deleted 24 hours
            after the room goes idle.
          </p>
          <h2 className="font-display text-xl font-bold text-ink mt-8">What we don&apos;t collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>No accounts or email addresses</li>
            <li>No location data</li>
            <li>No cookies for tracking</li>
            <li>No analytics that identify you personally</li>
          </ul>
          <h2 className="font-display text-xl font-bold text-ink mt-8">Third-party services</h2>
          <p>
            We use only privacy-friendly analytics (no cookies, no personal data) to
            understand how the app is used. Our hosting provider (Vercel) may collect
            standard server logs.
          </p>
          <h2 className="font-display text-xl font-bold text-ink mt-8">Your data, your control</h2>
          <p>
            Since we don&apos;t have accounts, there&apos;s nothing to delete. If you used
            cross-device mode, your room data disappears automatically within 24 hours.
            To expedite, simply close the room.
          </p>
          <p className="mt-8 text-sm text-ink-mute">
            Last updated: May 2026
          </p>
        </div>
      </main>

      <footer className="border-t-3 border-ink bg-bg-warm px-6 py-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-ink-mute">
          Lovebug · A silly little arcade for two
        </div>
      </footer>
    </div>
  );
}
