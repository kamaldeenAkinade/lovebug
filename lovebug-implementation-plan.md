# Lovebug Arcade — Implementation Plan

A playful couples game site. Three games, twelve decks, two play modes (same-device pass-and-play, and cross-device room codes). Built for laughter, not productivity. No accounts required for v1.

---

## 1. Product Definition

### What it is

A web app where couples play short, silly games together. They pick a game, pick a deck (content category), and play in rounds. Content is provided so neither partner has to invent anything from scratch.

### Who it's for

Couples who want a low-friction way to laugh together. Long-distance couples who miss shared activity. Couples on a date night looking for something better than TikTok. New couples who want a fun way to get to know each other. Old couples who want to remember they still can.

### Core principle

The product should hand players content, never demand creative writing from them under pressure. Their job is to react, predict, choose, and laugh.

### Success metric (for you, not vanity)

Average session length over 20 minutes. If couples are playing that long, the product works.

---

## 2. Play Modes

Two modes, selectable at room creation.

### Mode A: Same-Device (Pass and Play)

Both players use one phone or laptop. The screen explicitly prompts "Pass to [partner's name]" between turns. No room code needed. No internet needed beyond loading the site.

This is the default mode and should be the first option offered. Most couples are physically together.

### Mode B: Cross-Device (Room Code)

One player creates a room and gets a 4-letter code. The other player enters the code on their own device. State syncs between devices. This unlocks long-distance play.

---

## 3. Tech Stack

Keep it simple and free to run.

### Frontend
- **React** (Vite or Next.js, your call). Next.js is easier for the eventual landing page + app routing.
- **TypeScript** strongly recommended for state management sanity.
- **Tailwind CSS** for speed. Custom design tokens defined in `tailwind.config.js`.
- **Framer Motion** for confetti, reveal animations, and screen transitions.

### State and persistence
- **Same-device mode**: React state only. No backend needed. Optionally localStorage for "remember names" or "save funny answers."
- **Cross-device mode**: Real-time sync via either:
  - **Option 1 (recommended)**: Supabase Realtime (postgres + websockets free tier, zero infra)
  - **Option 2**: Firebase Realtime Database (similar, also free tier)
  - **Option 3 (cheap and dirty)**: Plain HTTP polling against a Vercel KV or Supabase row every 2 seconds. Works fine for turn-based games. This is what the v1 prototype uses.

For v1 cross-device, polling is fine. Real-time websockets only become necessary if you add a game where reaction time matters.

### Hosting
- **Vercel** free tier. Custom domain $12/year if you want one.

### Domain ideas
- lovebug.app
- playlovebug.com
- twoofus.fun

---

## 4. Information Architecture

```
/                       Landing page (marketing + start CTAs)
/play                   Mode selector: same-device or cross-device
/play/solo              Same-device flow
/play/room/new          Create cross-device room
/play/room/join         Enter room code
/play/room/[code]       Active cross-device room
/about                  Why we built this
/privacy                One-pager privacy doc
```

Inside any active game (solo or room), the URL stays stable. State is held in React + (optionally) localStorage or remote DB.

---

## 5. Game Specifications

Three games at launch. Each has 4 decks. Each deck has 50+ prompts at production scale (start with 10-15 per deck for prototype).

### Game 1: Would My Partner Rather

**Mechanic**: Two absurd or revealing this-or-that options appear. Each player picks what they would do, then guesses what their partner would pick. Reveal together. Point for each correct guess of partner.

**Decks**:
- Silly Street (chicken-sized horses energy)
- Big Hypotheticals (would you rather live 200 years vs 5 lives of 70 years)
- Hot Takes (pineapple on pizza, voice notes, etc.)
- Deep Cuts (forget happiest memory vs saddest memory)

**Round time**: 60-90 seconds.

**Same-device flow**:
1. Show question to Player 1. Ask their real pick.
2. Hide screen. Prompt "Pass to Player 2."
3. Player 2 sees the same question, makes their real pick.
4. Then Player 2 guesses what Player 1 picked.
5. Pass back to Player 1. Player 1 guesses what Player 2 picked.
6. Reveal screen shows both picks and both guesses side by side.

**Cross-device flow**:
1. Both players see the question simultaneously.
2. Each picks their answer and guesses partner's in one screen.
3. Once both submit, reveal screen shows everything.

### Game 2: How Well Do You Know Me

**Mechanic**: A question is shown. Each player writes their own answer AND their guess at their partner's answer. Reveal shows side by side. Players score each round together (both right / only me / only them / neither).

**Decks**:
- Everyday Us (what's my go-to drink order)
- Childhood Files (who was my first crush)
- Light Secrets (what's a habit I'm embarrassed about)
- About Us (what was the moment I knew)

**Round time**: 90-120 seconds.

**Same-device flow**:
1. Show question to Player 1. Player 1 writes their real answer + their guess of Player 2's answer. Both fields hidden after submit.
2. Pass to Player 2. Same process.
3. Reveal everything side by side.
4. Both players tap a scoring button together: both right, only me, only them, neither.

**Cross-device flow**:
1. Both players see question, fill both fields, submit independently.
2. Reveal shows everything once both have submitted.
3. Either player can tap the scoring decision (or use a "we agree" vote).

### Game 3: Couples Trivia Co-op

**Mechanic**: Multiple-choice trivia question. Both players answer independently. The couple only scores a point if both got it right.

**Decks**:
- 90s Nostalgia
- Food World
- Geography
- Weird and Wonderful

**Round time**: 30-45 seconds.

**Same-device flow**:
1. Show question to Player 1, four answer options. They pick. Hidden.
2. Pass to Player 2. They pick the same question without seeing Player 1's pick.
3. Reveal both picks and the correct answer. Score if both correct.

**Cross-device flow**:
1. Both see the question, pick independently.
2. Reveal once both have submitted.

---

## 6. Same-Device "Pass and Play" UX

This is the most important and most underdesigned part of these kinds of products. Get this right.

### Privacy screen between turns

When a player submits their answer, the next screen MUST hide their input before the device is passed. Show a full-screen "Pass to [partner's name]" prompt with a big tap-to-continue button. This prevents the receiving partner from accidentally seeing what the previous one wrote.

Visually, this screen should feel cinematic and warm, not transactional. Big emoji, soft animation, partner's name centered.

### Player setup

At the start of same-device mode, ask for both names. Use them throughout. "Pass to Aisha" is infinitely warmer than "Pass to Player 2."

### Avoid mid-round passing where possible

For Would My Partner Rather, you pass twice per round. That's a lot. Consider: have Player 1 submit BOTH their pick AND their guess of Player 2's pick on their turn, then pass once. Then Player 2 does the same. One pass per round.

For How Well Do You Know Me, this is natural: one pass per round.

For Trivia, one pass per round.

### Privacy by design

Use these techniques on the same-device screens:
- Inputs clear before the pass screen renders
- Submit buttons require an explicit tap (no auto-advance)
- Pass screens cover the full viewport with no peek-through
- Optional: a brief "shake to reveal" or "tap and hold" interaction on the receiving end so you can't accidentally see content

### Scoring display

Keep a running score visible in the header so they can see who's "winning." But also frame the framing carefully: "couples score" or "you two" rather than aggressive competition. The goal is laughter, not war.

---

## 7. Cross-Device Mode Architecture

### Room creation

Player 1 hits "Create a room." Server (or client, see below) generates a unique 4-letter code (excluding ambiguous letters like O, I). Code is stored as the room ID.

Use a wordlist or pure random uppercase letters from `ABCDEFGHJKLMNPQRSTUVWXYZ`. Skip O, I to avoid confusion with 0, 1.

### Room state structure

```typescript
type Room = {
  code: string;
  mode: 'cross-device';
  p1: Player | null;
  p2: Player | null;
  screen: 'lobby' | 'arcade' | 'game';
  currentGame: 'wmpr' | 'hwdykm' | 'trivia' | null;
  currentDeck: string | null;
  gameState: GameState | null;
  createdAt: number;
  expiresAt: number; // auto-delete after 24h of inactivity
};

type Player = {
  name: string;
  score: number;
  joinedAt: number;
};

type GameState = WMPRState | HWDYKMState | TriviaState;
```

### Sync strategy

**For v1: polling every 2 seconds.** Cheap, works on flaky networks, fine for turn-based games. Implementation is just `setInterval` calling a "load room state" function.

**For v2: Supabase Realtime channels.** Subscribe to changes on the room row, get instant updates. Cleaner UX, slightly more setup.

### Room expiry

Rooms older than 24 hours with no activity should be cleaned up. Set up a Supabase scheduled function or a Vercel cron that deletes expired rows daily.

### Handling reconnects

If a player closes the tab and comes back, store the room code + player role (p1 or p2) in localStorage. On app load, check for these and offer to rejoin. This saves couples from losing their score history.

---

## 8. Content Library Structure

Decks are JSON files. Easy to extend without code changes.

```typescript
// decks/wmpr/silly.ts
export const sillyDeck = {
  id: 'silly',
  name: 'Silly Street',
  emoji: '🎪',
  color: '#FFD93D',
  description: 'Cartoon logic, no consequences.',
  questions: [
    ['Fight 100 chicken-sized horses', 'Fight 1 horse-sized chicken'],
    ['Sneeze glitter forever', 'Cry tears that taste like Coke'],
    // ... 50+ entries
  ],
};
```

**Content writing principles**:
- Two roughly equal options. Neither should be obviously correct.
- Specific is funnier than generic. "Eat jollof for breakfast for 30 days" beats "eat unusual food."
- For deeper decks, give real emotional weight. Not everything needs a joke.
- Avoid prompts about exes, infidelity, family conflict, money fights, and weight. These derail rooms fast.
- Always include a "skip question" button in the UI for the ones that still land wrong.

**Target content volume for launch**:
- 50 prompts per WMPR deck (200 total across 4 default decks)
- 50 questions per HWDYKM deck (200 total)
- 30 trivia questions per Trivia deck (120 total)

**Content creation flow**: write them in batches. Use Claude to generate first drafts, then edit ruthlessly. Bad prompts kill the vibe faster than anything. Read every prompt out loud before shipping. If it doesn't make you smile or feel something, cut it.

### The Naija Edition (your real wedge)

Every couples game on the market is American. The tone, the references, the assumptions about how couples talk to each other. There's a real opening for a product that has both globally accessible content AND a confident, well-written Naija edition. Done right, this is a brand differentiator that pulls in both audiences, because Nigerians abroad will share it with their friends, and the global audience will find it refreshing.

**Don't make it a gimmick.** The Naija decks should feel like they were written by someone who actually lives here, not a parody. The humor lands when it's specific: NEPA, danfo conductors, the auntie who asks when you're getting married at every owambe, jollof discourse, the difference between "I'm coming" and actually coming.

**Naija-specific deck ideas**:

For Would My Partner Rather:
- **9ja Wahala**: Everyday Nigerian dilemmas. ("Marry someone whose mum lives with you, or marry someone whose entire village calls every Sunday for hand-out.")
- **Owambe Edition**: Wedding and party chaos. ("Be the aspiring DJ who plays only Apala at a Lagos wedding, or be the MC who can't pronounce the couple's names.")

For How Well Do You Know Me:
- **Our Story (Naija edition)**: How we met, when we knew, the family approval journey, the bride-price conversation, our first owambe as a couple.

For Couples Trivia:
- **Naija Pop Culture**: Nollywood, Afrobeats, classic NTA shows, slang origins, who said what in which movie.
- **Lagos Living**: Traffic routes, the neighborhood that never sleeps, the market for every need.

**Positioning**: Launch with global decks as the default, Naija edition as a clearly-labeled deck pack within each game (not a separate product). Free for v1. If you ever monetize, premium themed packs (Newlywed Naija, Long-Distance Diaspora) are obvious upsells.

**Writing the Naija decks**: get a second reader. Your wife, a friend couple, anyone who'll laugh honestly. Cultural humor falls flat fast when it's just you in your head.

---

## 9. Design System

### Visual identity

Warm playful brutalism. Chunky borders, drop shadows, sticker aesthetic, generous use of accent colors. Editorial serif paired with clean sans.

### Type stack

- **Display**: Fraunces (variable serif, expressive, free on Google Fonts)
- **UI**: Inter (clean, neutral)

### Color tokens

```css
--bg-warm: #FFF4E6;
--bg-peach: #FFE8D6;
--bg-coral: #FFD9C0;
--ink: #2D1B14;
--ink-soft: #5C3A2E;
--ink-mute: #8B6B5C;

--accent-red: #FF6B6B;
--accent-yellow: #FFD93D;
--accent-pink: #FF8FB1;
--accent-purple: #A78BFA;
--accent-green: #6BCB77;
```

### Component primitives

- **Button**: 3px black border, colored fill, drop shadow offset 4px, hover lifts shadow to 6px
- **Input**: same border treatment, cream fill, large type, focus state lifts shadow
- **Card**: 3px border, cream fill, drop shadow in accent color
- **Sticker**: pill shape, small text, used for labels and metadata

### Motion

- Float-up entrance on screen transitions (200ms ease-out)
- Confetti burst on partner join, on correct guesses, on reveal
- Wobble animation on emoji elements (subtle, infinite)
- Pop-in on conditional UI (when a step unlocks)

Keep motion playful but never trap users in waiting animations longer than 400ms.

---

## 10. Brand Voice

Warm, witty, slightly cheeky. Not therapy-speak. Not corporate. Not Cards Against Humanity edgy either.

### Examples of good copy

- "Play your way back to each other."
- "Made for the kind of love that survives Wi-Fi."
- "Pass to [partner's name]"
- "The lie should be just believable enough."

### Examples to avoid

- "Strengthen your relationship through evidence-based exercises." (clinical)
- "Get spicy with your bae 😈🔥" (trying too hard)
- "Connect with your partner." (generic)

---

## 11. Build Sequence

Hand this to Claude Code or work through it yourself.

### Phase 1: Foundation (Day 1-2)

1. Scaffold Next.js 14 + TypeScript + Tailwind project
2. Set up font loading (Fraunces, Inter) via next/font
3. Build the design tokens in `tailwind.config.js` and base styles in `globals.css`
4. Build shared components: `Button`, `Input`, `Card`, `Sticker`, `DeckBadge`, `Confetti`, `PassPhone`
5. Build the landing page with the three game cards
6. Build the mode selector at `/play`

### Phase 2: Same-Device Mode (Day 3-5)

7. Build the name entry screen for solo mode
8. Build the arcade dashboard with three game tiles
9. Build the deck picker
10. Implement Game 1 (WMPR) same-device flow with `PassPhone` between turns
11. Implement Game 2 (HWDYKM) same-device flow
12. Implement Game 3 (Trivia) same-device flow
13. Implement the reveal screens for each game with score tracking
14. Test the full flow with a partner (or yourself with two pretend names) for at least 30 minutes per game

### Phase 3: Content (Day 6-7)

15. Write 50 prompts per WMPR deck
16. Write 50 questions per HWDYKM deck
17. Write 30 questions per Trivia deck
18. Have someone other than you read every single prompt and flag the bad ones

### Phase 4: Cross-Device Mode (Day 8-10)

19. Set up Supabase project, create `rooms` table
20. Build the room creation API
21. Build the room join flow
22. Add the polling sync layer (or Supabase Realtime if you're feeling ambitious)
23. Adapt each game component to work in either mode (same components, conditional flow)
24. Build the "waiting for partner" states
25. Add localStorage-based reconnect

### Phase 5: Polish (Day 11-14)

26. Confetti tuning
27. Sound effects (optional, off by default, toggleable)
28. Mobile responsive testing on real phones
29. Privacy policy and basic legal pages
30. Open Graph images for social sharing
31. Analytics (Plausible or Vercel Analytics, privacy-friendly)
32. Deploy to Vercel with custom domain

### Phase 6: Launch (Week 3)

33. Build a launch post for LinkedIn
34. Build a Product Hunt page if you want
35. Reach out to 10 friends to play and give feedback
36. Iterate based on what breaks

---

## 12. Features Explicitly NOT in v1

Cut these. Add them later only if users ask.

- User accounts and login
- Cloud-saved play history
- More than 3 games
- Custom deck creation by users
- Multiplayer beyond 2 people (no group chat games)
- Real-time video or voice integration
- AI-generated personalized prompts
- Subscriptions or paywall
- Mobile native apps
- Notifications
- Friend systems or social features

---

## 13. Monetization (Optional, Post-Launch)

If the product gets traction, here are honest options ranked by friction.

1. **Premium deck packs** ($2-5 one-time): "Spicy edition," "Newlyweds," "Long Distance Special," "Naija edition." Low friction, fits the product, doesn't gate the core experience.

2. **Lifetime unlock** ($10-15): Removes any locked decks, ad-free if you ever add ads. Simple.

3. **Free for couples, paid for events**: Group/party version for bachelorette parties, retreats, weddings. Different product really.

4. **Affiliate**: Date night recommendations, gift ideas, etc. Be careful, can cheapen the brand.

Avoid subscriptions unless you commit to ongoing fresh content drops. Subscription fatigue is real.

---

## 14. Risks and How to Handle Them

**Risk: Content goes stale.** Mitigation: ship with 1000+ prompts at launch, add seasonal packs (Valentine's, anniversary themes, holidays).

**Risk: Same-device privacy leaks.** Mitigation: rigorous test of the pass-phone screens. Never auto-advance. Always require explicit tap to reveal.

**Risk: Cross-device sync breaks on bad networks.** Mitigation: polling is more resilient than websockets here. Show clear "waiting" states. Allow graceful retry.

**Risk: Couples have a real fight triggered by a prompt.** Mitigation: tone of decks matters. Avoid prompts about exes, cheating, money, family conflict. Add a "skip question" button always available.

**Risk: It feels like every other couples app.** Mitigation: voice. Brand. The arcade format. Real laughs. The Naija-localized decks if you want a wedge.

---

## 15. Files and Folder Structure

```
lovebug/
├── app/
│   ├── page.tsx                    # Landing
│   ├── play/
│   │   ├── page.tsx                # Mode selector
│   │   ├── solo/
│   │   │   ├── page.tsx            # Solo setup
│   │   │   └── [...flow].tsx       # Solo game flow
│   │   └── room/
│   │       ├── new/page.tsx
│   │       ├── join/page.tsx
│   │       └── [code]/page.tsx     # Room game flow
│   ├── about/page.tsx
│   └── layout.tsx
├── components/
│   ├── shared/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Sticker.tsx
│   │   ├── DeckBadge.tsx
│   │   ├── Confetti.tsx
│   │   └── PassPhone.tsx
│   ├── games/
│   │   ├── WMPR/
│   │   │   ├── WMPRGame.tsx
│   │   │   ├── WMPRSolo.tsx
│   │   │   ├── WMPRRoom.tsx
│   │   │   └── WMPRReveal.tsx
│   │   ├── HWDYKM/
│   │   └── Trivia/
│   ├── arcade/
│   │   ├── ArcadeDashboard.tsx
│   │   └── DeckPicker.tsx
│   └── landing/
│       └── GameCard.tsx
├── content/
│   ├── wmpr/
│   │   ├── silly.ts
│   │   ├── hypothetical.ts
│   │   ├── hottakes.ts
│   │   └── deepcuts.ts
│   ├── hwdykm/
│   └── trivia/
├── lib/
│   ├── room.ts                     # Room state utilities
│   ├── supabase.ts                 # Supabase client
│   ├── slug.ts                     # Room code generator
│   └── types.ts
├── styles/
│   └── globals.css
├── public/
│   └── og-image.png
└── tailwind.config.js
```

---

## 16. Prompt for Claude Code or Your AI Assistant

Use this as the kickoff prompt:

> Build Lovebug Arcade, a Next.js 14 + TypeScript + Tailwind project for a couples game site. There are three games (Would My Partner Rather, How Well Do You Know Me, Couples Trivia) and two play modes (same-device pass-and-play, cross-device room codes via Supabase polling). Start with Phase 1 of the implementation plan: scaffold the project, set up fonts (Fraunces and Inter via next/font), implement the design tokens in tailwind.config.js, and build the shared component library (Button, Input, Card, Sticker, DeckBadge, Confetti, PassPhone). Use the design language: chunky 3px black borders, drop shadow offsets, warm cream backgrounds, coral and buttery yellow accents. Show me the file structure before writing code, then proceed file by file.

Then iterate phase by phase.

---

## 17. Launch-Ready Content (Drop-In Files)

These are starter prompts you can ship with the prototype. Goal: enough to play full sessions without seeing repeats too quickly. Expand to 50 per deck before public launch, but this is enough to test seriously with real couples.

### WMPR · Silly Street (50 prompts)

```typescript
export const sillyDeck = {
  id: 'silly',
  name: 'Silly Street',
  emoji: '🎪',
  color: '#FFD93D',
  description: 'Cartoon logic, no consequences.',
  questions: [
    ['Fight 100 chicken-sized horses', 'Fight 1 horse-sized chicken'],
    ['Sneeze glitter forever', 'Cry tears that taste like Coke'],
    ['Have fingers as long as your legs', 'Have legs as short as your fingers'],
    ['Speak only in rhyme for a year', 'Sing every sentence for a year'],
    ['Have a tail you cannot hide', 'Have ears that wiggle whenever you lie'],
    ['Always smell faintly of fresh bread', 'Always hear distant accordion music'],
    ['Have a permanent cartoon halo', 'Have a tiny rain cloud above you indoors only'],
    ['Sweat maple syrup', 'Cry hot pepper sauce'],
    ['Be three feet tall forever', 'Be eight feet tall forever'],
    ['Have hiccups for life', 'Yawn every sixty seconds for life'],
    ['Have a built-in laugh track that follows you', 'Have a dramatic violin sting after every sentence'],
    ['Be able to talk to pigeons (they are mean)', 'Be able to talk to plants (they are bored)'],
    ['Have hair that grows one inch every time you lie', 'Have nails that grow one inch every time you gossip'],
    ['Burp glitter', 'Sneeze rose petals'],
    ['Have a mustache made of bees (gentle)', 'Have eyebrows made of butterflies (clingy)'],
    ['Be followed by gentle harp music wherever you go', 'Have a personal narrator describe your every move'],
    ['Have feet that squeak when you walk', 'Have hands that beep when you point'],
    ['Be allergic to your own laughter', 'Be allergic to compliments'],
    ['Have one finger that glows in the dark', 'Have one tooth that always whistles'],
    ['Speak fluent baby talk to all adults', 'Speak only in formal Shakespearean to babies'],
    ['Have your shadow be a different animal each day', 'Have your reflection always be three seconds late'],
    ['Wake up every day in a slightly different bed', 'Wake up every day with a slightly different name'],
    ['Have a sneeze that sounds like a goose', 'Have a cough that sounds like a kazoo'],
    ['Always lose at rock paper scissors', 'Always win at coin tosses but suspiciously'],
    ['Have your phone always autocorrect to "lasagna"', 'Have your phone always autocorrect to "wahala"'],
    ['Have one eyebrow that lifts uncontrollably', 'Have one finger that points wherever it wants'],
    ['Be the world champion at thumb wrestling but no one cares', 'Be the world champion at staring contests but for two seconds'],
    ['Have a song stuck in your head forever (you pick)', 'Have a different song stuck in your head every day (random)'],
    ['Walk three feet behind yourself at all times', 'Walk three feet ahead of yourself at all times'],
    ['Have your dreams broadcast on a small TV in your living room', 'Have your thoughts whispered by a polite ghost'],
    ['Be the only person who can see one extra color', 'Be the only person who can hear one extra note'],
    ['Have a small cloud follow you that rains only on Tuesdays', 'Have a small sun follow you that shines only at 3am'],
    ['Have to clap before entering any room', 'Have to bow slightly when leaving any room'],
    ['Have a pocket that always has one wet sock in it', 'Have a pocket that always has one warm bean in it'],
    ['Be the worlds best at impressions but only of furniture', 'Be the worlds best at karaoke but only of national anthems'],
    ['Have your handshake play a tiny fanfare', 'Have your hug make a soft popcorn sound'],
    ['Always know what time it is to the exact second (annoyingly)', 'Always know the temperature to the exact degree (uselessly)'],
    ['Be irresistibly drawn to fold every towel you see', 'Be irresistibly drawn to align every book you see'],
    ['Have a tiny invisible duck that quacks when you lie', 'Have a tiny invisible cat that purrs when you are right'],
    ['Be slightly damp at all times', 'Be slightly dusty at all times'],
    ['Have a sense of taste that ranks everything from one to ten out loud', 'Have a sense of smell that names every scent dramatically'],
    ['Have your sneezes echo for thirty seconds', 'Have your laughs echo for one minute'],
    ['Be physically incapable of whispering', 'Be physically incapable of shouting'],
    ['Have a soundtrack that swells whenever you enter a room', 'Have a record-scratch sound every time you change your mind'],
    ['Be able to fold space but only inside your fridge', 'Be able to fold time but only inside your shower'],
    ['Have a parrot on your shoulder that only speaks finance', 'Have a hamster in your pocket that only speaks Latin'],
    ['Be served cake at every meeting you attend forever', 'Be served jollof at every conference you attend forever'],
    ['Have your dreams written and directed by a B-movie crew', 'Have your dreams scored by a frantic jazz trio'],
    ['Have a permanent confetti trail when you walk', 'Have a permanent applause track when you sit'],
    ['Be physically unable to enter a room without doing jazz hands', 'Be physically unable to leave a room without taking a bow'],
  ],
};
```

### WMPR · Big Hypotheticals (25 starter prompts)

```typescript
export const hypotheticalDeck = {
  id: 'hypothetical',
  name: 'Big Hypotheticals',
  emoji: '🌪️',
  color: '#FF8FB1',
  description: 'Real questions disguised as games.',
  questions: [
    ['Read minds, but only of strangers', 'Be invisible, but only when alone'],
    ['Live 200 years as yourself', 'Live 5 lives of 70 years each with no memory between'],
    ['Win the lottery but lose your sense of taste', 'Stay broke but taste food in HD'],
    ['Know exactly how you die', 'Know exactly when you die'],
    ['Teleport but only to places you have been before', 'Fly but only as fast as you can run'],
    ['Speak every language but forget your native one', 'Stay exactly as you are now'],
    ['Have unlimited money but zero privacy', 'Have unlimited privacy but an average income'],
    ['Be famous for something embarrassing', 'Be unknown but legendary in your field'],
    ['Always know when someone is lying', 'Always know when someone is in love'],
    ['Live one perfect day on repeat', 'Live a normal varied life'],
    ['Remember every dream you ever had', 'Remember every meal you ever ate'],
    ['Be able to undo any one moment in your life', 'Be able to relive any one moment in your life'],
    ['Have a perfectly accurate memory', 'Have a perfect imagination'],
    ['Always be five minutes early everywhere', 'Always have five extra minutes when you need them'],
    ['Know what every animal is thinking', 'Know what every baby is thinking'],
    ['Have your dream career and average love life', 'Have an average career and dream love life'],
    ['Live anywhere in the world but never see your family', 'Live near your family but never travel'],
    ['Be the smartest person in every room', 'Be the kindest person in every room'],
    ['Know the answer to one big question (you pick)', 'Know the answer to a hundred small ones'],
    ['Have a guaranteed soulmate but you have to find them', 'Build something great with someone good enough'],
    ['Be guaranteed to be remembered after you die', 'Be guaranteed to be present while you live'],
    ['Be able to pause time for one hour a day', 'Be able to rewind time for one minute a day'],
    ['Have a magic mirror that tells you the truth', 'Have a magic notebook that writes back'],
    ['Always say the right thing', 'Always know the right thing to do'],
    ['Be loved deeply by one person', 'Be liked warmly by everyone'],
  ],
};
```

### WMPR · Hot Takes (25 starter prompts)

```typescript
export const hotTakesDeck = {
  id: 'hottakes',
  name: 'Hot Takes',
  emoji: '🌶️',
  color: '#FF6B6B',
  description: 'Petty opinions, fully aired.',
  questions: [
    ['Pineapple belongs on pizza', 'Pineapple on pizza is a war crime'],
    ['Cereal is a soup', 'Cereal is its own thing, leave me alone'],
    ['Hot dogs are sandwiches', 'Hot dogs are tacos'],
    ['Texting "k" is fine', 'Texting "k" is hostile'],
    ['Socks with sandals is acceptable', 'Socks with sandals is a crime'],
    ['Movie theaters are still better than streaming', 'Streaming wins every time'],
    ['Plane window seat', 'Plane aisle seat (window people are wrong)'],
    ['Wedding registries are practical', 'Wedding registries are tacky'],
    ['Voice notes are efficient', 'Voice notes are a personal attack'],
    ['Group chats should be muted by default', 'Group chats should be loud and proud'],
    ['Bread should always be toasted', 'Toasting bread is overrated'],
    ['Cold pizza is better than hot pizza', 'Cold pizza is suffering'],
    ['Birthday parties for adults are sweet', 'Birthday parties for adults are tragic'],
    ['Reply-all is a useful tool', 'Reply-all should be illegal'],
    ['Always tip the delivery guy generously', 'Tipping culture has gone too far'],
    ['Phone calls beat texts every time', 'Phone calls without warning are rude'],
    ['Replying to a story with a single emoji is fine', 'Replying to a story with a single emoji is lazy'],
    ['Buffet restaurants are joyful', 'Buffet restaurants are deeply sad'],
    ['Decorating for Christmas before December is a sin', 'November Christmas trees are valid'],
    ['Brunch is overrated', 'Brunch is sacred'],
    ['Dogs are clearly better than cats', 'Cats are clearly better than dogs'],
    ['Owning a smart speaker is convenient', 'Smart speakers are spying on us'],
    ['Coffee is just bean water', 'Coffee is liquid serotonin'],
    ['Working from a cafe is productive', 'Working from a cafe is performance art'],
    ['Asking for the WiFi password before saying hello is acceptable', 'Asking for the WiFi password before saying hello is rude'],
  ],
};
```

### WMPR · Deep Cuts (20 starter prompts)

```typescript
export const deepCutsDeck = {
  id: 'deepcuts',
  name: 'Deep Cuts',
  emoji: '🌙',
  color: '#A78BFA',
  description: 'Soft questions for quiet evenings.',
  questions: [
    ['Forget your happiest memory', 'Forget your saddest memory'],
    ['Be deeply understood by one person', 'Be liked by everyone you meet'],
    ['Travel anywhere alone', 'Stay home with the people you love'],
    ['Have your dream career and an average love life', 'Have an average career and a dream love life'],
    ['Always know what people really think of you', 'Never know what anyone thinks of you'],
    ['Be the funniest person in the room', 'Be the kindest person in the room'],
    ['Have one true calling', 'Be quietly good at many things'],
    ['Live where you grew up forever', 'Never go back home'],
    ['Be remembered after you die', 'Be deeply present while you live'],
    ['Have all the answers but no questions', 'Have all the questions but no answers'],
    ['Be the one who loves more', 'Be the one who is loved more'],
    ['Know your purpose at age 20', 'Find it slowly over many years'],
    ['Be brave for an hour a day', 'Be patient all the time'],
    ['Have a life full of small joys', 'Have a life with one great triumph'],
    ['Spend a year in a place you have always dreamed of, alone', 'Spend ten years in the same town with your favorite people'],
    ['Apologize to someone you wronged', 'Forgive someone who wronged you'],
    ['Always be slightly ahead of where you wanted to be', 'Always be slightly behind, but enjoying the road'],
    ['Be the person who makes others feel seen', 'Be the person who is finally seen'],
    ['Take a leap and possibly fail', 'Stay safe and possibly wonder'],
    ['Be sure', 'Be open'],
  ],
};
```

### HWDYKM · Everyday Us (starter set, expand to 50)

```typescript
export const everydayDeck = {
  id: 'everyday',
  name: 'Everyday Us',
  emoji: '☕',
  color: '#FFD93D',
  description: 'The questions you forget to ask.',
  questions: [
    "What's my comfort food when I am stressed?",
    "What's the first thing I do when I wake up?",
    "Which of my friends do I secretly find exhausting?",
    "What's my go-to drink order?",
    "What show could I rewatch forever?",
    "What's my biggest pet peeve?",
    "What time do I actually want to go to bed?",
    "Which household chore do I hate most?",
    "What's my karaoke song?",
    "What do I do with my phone in the bathroom?",
    "What part of my morning routine could I never skip?",
    "What is the snack I always reach for when no one is watching?",
    "Which app do I spend the most time on?",
    "What is the one chore I secretly enjoy?",
    "How do I usually unwind after a long day?",
    "What is the small thing that always makes me smile?",
    "Which season feels most like me?",
    "What kind of weather puts me in the best mood?",
    "What is my real, honest opinion on small talk?",
    "What is one thing I have been quietly looking forward to?",
    "If I had a free Saturday with no plans, what would I actually do?",
    "What is my favorite way to eat eggs?",
    "Which family member do I sound most like?",
    "What is the last thing I googled?",
    "What is something small I do every day that I think no one notices?",
  ],
};
```

### Trivia · Weird and Wonderful (starter set, expand to 30)

```typescript
export const weirdTriviaDeck = {
  id: 'weird',
  name: 'Weird and Wonderful',
  emoji: '🦑',
  color: '#A78BFA',
  description: 'Facts that sound made up.',
  questions: [
    { q: 'How many hearts does an octopus have?', options: ['1', '2', '3', '4'], answer: 2 },
    { q: 'What color is a polar bears skin under its fur?', options: ['White', 'Pink', 'Black', 'Grey'], answer: 2 },
    { q: 'Which animal can sleep for up to three years at a time?', options: ['Bear', 'Snail', 'Sloth', 'Bat'], answer: 1 },
    { q: 'What is the only food that never spoils?', options: ['Salt', 'Sugar', 'Honey', 'Rice'], answer: 2 },
    { q: 'How long is one day on Venus compared to Earth?', options: ['12 hours', '1 Earth week', '243 Earth days', '1 Earth year'], answer: 2 },
    { q: 'A group of flamingos is called a what?', options: ['Flock', 'Flamboyance', 'Flutter', 'Flair'], answer: 1 },
    { q: 'Which planet rains diamonds, according to current theory?', options: ['Mars', 'Neptune', 'Mercury', 'Saturn'], answer: 1 },
    { q: 'What is the smallest country in the world by area?', options: ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], answer: 2 },
    { q: 'How many bones is a baby born with?', options: ['206', '270', '300', '350'], answer: 2 },
    { q: 'Which animal has fingerprints almost identical to humans?', options: ['Gorilla', 'Koala', 'Chimpanzee', 'Orangutan'], answer: 1 },
    { q: 'What is a banana botanically classified as?', options: ['Fruit', 'Berry', 'Vegetable', 'Herb'], answer: 1 },
    { q: 'How many time zones does France span (counting overseas territories)?', options: ['5', '8', '12', '15'], answer: 2 },
  ],
};
```

### Quick-fire prompt for the rest

To generate the remaining decks at production scale, use this prompt with Claude or another AI:

> Write 50 "Would You Rather" prompts for the [DECK NAME] deck of a couples game called Lovebug. Tone: [SILLY / HYPOTHETICAL / HOT TAKE / TENDER]. Each prompt should be two roughly equal options separated by " | ". Avoid prompts about exes, infidelity, family conflict, money fights, or weight. Make them specific, not generic. Output as a TypeScript array of two-element string arrays.

Edit ruthlessly. Cut anything that doesn't make you smile or feel something. Bad prompts are worse than fewer prompts.

---

## 18. Landing Page Copy

Use this as a starting point for the marketing site. Edit to match your final brand voice.

### Hero

**Eyebrow sticker**: ♥ A silly little arcade for two

**Headline**: Play your way back to *each other*.

**Subhead**: Three quick games. Pick a deck, predict your partner, react and laugh. No accounts, no scheduling, no creative pressure. Just a four-letter room code and your person, whether they are across the couch or across the country.

**Primary CTA**: Start a room
**Secondary CTA**: I have a code

### Section 2: What's inside

**Section header**: Three games. Twelve decks. Endless laughs.

**Game card 1 (Would My Partner Rather)**:
Title: Would My Partner Rather
Tagline: Absurd this-or-thats. Guess what they would pick. Score points for matching their answer.
Time: ~5 min · 4 decks

**Game card 2 (How Well Do You Know Me)**:
Title: How Well Do You Know Me
Tagline: We hand you the questions. Predict your partner's answer. Watch each other react.
Time: ~10 min · 4 decks

**Game card 3 (Couples Trivia)**:
Title: Couples Trivia
Tagline: You both answer the same question. You only score if both of you get it right.
Time: ~7 min · 4 decks

### Section 3: How it works

**Section header**: Together on the couch or texting across timezones.

**Three steps**:
1. **Pick your mode.** Same phone, passed back and forth. Or two phones, anywhere in the world.
2. **Pick a game and a deck.** Silly, sweet, thoughtful, or chaotic, you choose the vibe.
3. **Play, laugh, switch.** Bounce between games whenever the mood shifts. The arcade is always open.

### Section 4: Why we built it

**Section header**: Most relationship apps want to fix you. We just want to make you laugh.

**Body**: There are journaling apps, therapy apps, and date-night-planning apps. They all assume your relationship is a problem to solve. Lovebug doesn't. It assumes you already love each other and just want twenty minutes that don't involve scrolling separate feeds in the same room. Pick a game. Hand over the phone. Find each other again.

### Section 5: For long-distance couples

**Section header**: Built for the kind of love that survives Wi-Fi.

**Body**: Distance is hard. Voice calls run out of things to say. Texting goes quiet. Lovebug gives you something to actually do together when the world keeps you apart. Open a room, send your partner the four-letter code, and play. The same game, at the same time, just on different couches.

### Section 6: Final CTA

**Header**: Ready to be ridiculous together?

**Subhead**: Two minutes to set up. Probably an hour before you look up.

**Primary CTA**: Start a room

### Footer

**Tagline**: Made for the kind of love that survives Wi-Fi.

**Links**: About · Privacy · Send feedback · [Your name or studio]

### Open Graph / Social Card

**OG title**: Lovebug · A silly little arcade for two
**OG description**: Three quick games for couples. Together on the couch or texting across timezones. No accounts, no scheduling, no creative pressure.
**OG image**: Use the warm cream background, the heart logo, and the headline "Play your way back to each other" in Fraunces. Coral and yellow accents.

---

## 19. Final Note

Don't perfect everything before shipping. The fastest way to know if this is good is to play it with your wife on a Tuesday night, then play it again with a friend couple on Saturday. Their reactions will tell you more than any planning document.

The plan above is comprehensive because you asked for it. The MVP is much smaller: same-device mode, one game, three decks, deployed. That's a one-weekend ship. Everything else is iteration.

Build the one-weekend version first.
