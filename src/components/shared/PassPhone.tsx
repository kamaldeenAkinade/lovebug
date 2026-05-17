'use client';

import Button from './Button';

interface PassPhoneProps {
  name: string;
  onContinue: () => void;
  fromName?: string;
}

export default function PassPhone({ name, onContinue, fromName }: PassPhoneProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-warm chunky-border">
      <div className="text-center animate-float-up px-8">
        <div className="text-6xl mb-4">📱</div>
        <h2 className="font-display text-3xl font-bold text-ink mb-2">
          Pass to {name}
        </h2>
        {fromName && (
          <p className="text-ink-soft font-sans text-lg mb-8">
            {fromName} is done!
          </p>
        )}
        <Button variant="primary" onClick={onContinue} className="text-xl px-10 py-4">
          Tap to continue
        </Button>
      </div>
    </div>
  );
}
