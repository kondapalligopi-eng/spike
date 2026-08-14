import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '@/components/PageHead';
import { HeroPaws } from '@/components/HeroPaws';
import './PetPlay.css';

// Sniff & Find: Treat Hunt — a treat is hidden in one of three bowls and the dog
// (or the owner) picks. Front-end only for now: points are a local session
// tally, and gift-card redemption is intentionally not live until scoring
// moves server-side. See the "Rewards" note at the bottom of the page.

type Mode = 'me' | 'dog';
type Game = 'bowls' | 'hands';

const ARIA: Record<Game, string[]> = {
  bowls: ['Left bowl', 'Middle bowl', 'Right bowl'],
  hands: ['Left hand', 'Right hand'],
};
const CHOICES: Record<Game, number> = { bowls: 3, hands: 2 };

// Biscuit heap. c: 'g' golden bake / 'w' milk-white — alternated so neighbours differ.
const PILE = [
  { l: -3, t: 98, r: '-5deg', s: 1, c: 'g' }, { l: 21, t: 100, r: '8deg', s: 1.02, c: 'w' },
  { l: 45, t: 97, r: '-11deg', s: 0.98, c: 'g' }, { l: 66, t: 92, r: '14deg', s: 0.92, c: 'w' },
  { l: -6, t: 74, r: '12deg', s: 0.97, c: 'w' }, { l: 17, t: 78, r: '-8deg', s: 1.04, c: 'g' },
  { l: 41, t: 76, r: '15deg', s: 1, c: 'w' }, { l: 65, t: 70, r: '-6deg', s: 0.95, c: 'g' },
  { l: -2, t: 50, r: '-15deg', s: 1, c: 'g' }, { l: 23, t: 53, r: '9deg', s: 1.05, c: 'w' },
  { l: 47, t: 51, r: '-4deg', s: 1, c: 'g' }, { l: 68, t: 46, r: '20deg', s: 0.9, c: 'w' },
  { l: 3, t: 26, r: '7deg', s: 0.98, c: 'w' }, { l: 28, t: 24, r: '-13deg', s: 1.02, c: 'g' },
  { l: 53, t: 27, r: '6deg', s: 0.96, c: 'w' },
  { l: 15, t: 4, r: '-8deg', s: 0.93, c: 'g' }, { l: 42, t: 1, r: '11deg', s: 0.96, c: 'w' },
];

// Mirrored pairs — each left star has a twin at the same height on the right.
const STARS: { top: string; side: 'left' | 'right'; off: string; w: number; d: string; gold?: boolean }[] = [
  { top: '6%', side: 'left', off: '10%', w: 20, d: '0s' }, { top: '6%', side: 'right', off: '10%', w: 20, d: '1.5s' },
  { top: '18%', side: 'left', off: '25%', w: 12, d: '.7s', gold: true }, { top: '18%', side: 'right', off: '25%', w: 12, d: '2.3s', gold: true },
  { top: '31%', side: 'left', off: '3%', w: 13, d: '2.4s' }, { top: '31%', side: 'right', off: '3%', w: 13, d: '.9s' },
  { top: '47%', side: 'left', off: '9%', w: 9, d: '3.1s' }, { top: '47%', side: 'right', off: '9%', w: 9, d: '1.2s' },
  { top: '61%', side: 'left', off: '2%', w: 15, d: '2s', gold: true }, { top: '61%', side: 'right', off: '2%', w: 15, d: '.45s', gold: true },
  { top: '73%', side: 'left', off: '36%', w: 10, d: '2.6s' }, { top: '73%', side: 'right', off: '36%', w: 10, d: '.5s' },
  { top: '88%', side: 'left', off: '7%', w: 16, d: '1.25s' }, { top: '88%', side: 'right', off: '7%', w: 16, d: '2.9s' },
];

const REWARD_GOAL = 500;

export function PetPlay() {
  const [game, setGame] = useState<Game>('bowls');
  const [mode, setMode] = useState<Mode>('me');
  const [picked, setPicked] = useState<number | null>(null);
  const [sniffing, setSniffing] = useState(false);
  // In "Dog picks" the dog auto-plays; when it hits the 500-point goal we pause
  // the loop (else it runs forever) until the player taps "Play again".
  const [dogStopped, setDogStopped] = useState(false);
  const [points, setPoints] = useState(0);
  const [gain, setGain] = useState(0);
  const [pawUp, setPawUp] = useState(false);
  const [hitGoal, setHitGoal] = useState(false);
  const [heroHidden, setHeroHidden] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pawTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Let the hero introduce the page, then fold it away so the board sits high
    // on screen. Runs client-side only, so the pre-rendered HTML still ships the
    // hero (and its h1) intact for crawlers.
    const heroT = setTimeout(() => setHeroHidden(true), 1000);
    return () => {
      clearTimeout(heroT);
      if (timer.current) clearTimeout(timer.current);
      if (pawTimer.current) clearInterval(pawTimer.current);
    };
  }, []);

  const done = picked !== null;

  // The chosen bowl is always the one holding the treat — the dog never comes
  // away empty. The other two grey out so the pick reads clearly.
  const pick = useCallback((i: number) => {
    if (picked !== null) return;
    const g = 30 + Math.floor(Math.random() * 31);
    const next = points + g;
    // The counter is a lap to 500, not a running total: once the goal is hit it
    // rolls back to zero so the number can never read past the goal.
    const reached = next >= REWARD_GOAL;
    setGain(g);
    setHitGoal(reached);
    setPoints(reached ? 0 : next);
    setPicked(i);
    // Reaching the goal ends the dog's auto-run (see effects) — the player taps
    // "Play again" to start another lap.
    if (reached && mode === 'dog') setDogStopped(true);
    // if they play before the timer fires, fold the hero now so the result
    // never lands below the fold
    setHeroHidden(true);
  }, [picked, points, mode]);

  // Two real photos of Messi — sitting and with a paw raised — alternated so he
  // actually paws the air while he searches. Both frames are pre-aligned on his
  // feet, so only the paw moves between them.
  const sniff = useCallback(() => {
    if (done || sniffing) return;
    setSniffing(true);
    setPawUp(true);
    pawTimer.current = setInterval(() => setPawUp((v) => !v), 195);
    timer.current = setTimeout(() => {
      if (pawTimer.current) clearInterval(pawTimer.current);
      setPawUp(false);
      setSniffing(false);
      pick(Math.floor(Math.random() * CHOICES[game]));
    }, 1250);
  }, [done, sniffing, pick, game]);

  const again = useCallback(() => {
    setPicked(null);
    setGain(0);
    setHitGoal(false);
  }, []);

  // Switching games resets the round (points carry over — they're one shared
  // tally). Also cancels any in-flight sniff and clears the dog's goal-pause so
  // switching tabs can never leave the board stuck.
  const switchGame = useCallback((g: Game) => {
    if (timer.current) clearTimeout(timer.current);
    if (pawTimer.current) clearInterval(pawTimer.current);
    setGame(g);
    setPicked(null);
    setGain(0);
    setHitGoal(false);
    setSniffing(false);
    setPawUp(false);
    setDogStopped(false);
  }, []);

  // Picking who plays. In "Dog picks" the dog keeps playing on its own (see the
  // effect below) until the player switches back to "I'll pick" — so there's no
  // confusing "tap the blue toggle again" step. Cancels any in-flight sniff and
  // clears the current round so it starts clean either way.
  const chooseMode = useCallback((m: Mode) => {
    if (timer.current) clearTimeout(timer.current);
    if (pawTimer.current) clearInterval(pawTimer.current);
    setSniffing(false);
    setPawUp(false);
    setPicked(null);
    setGain(0);
    setHitGoal(false);
    setDogStopped(false);
    setMode(m);
  }, []);

  // Auto-reset a couple of seconds after a win, so players don't have to tap a
  // "play again" button every round — they just keep picking. When the dog hits
  // the goal in auto-mode we instead reset all the way to the original default
  // (Treat Hunt · I'll pick), so the loop can't run forever or get stuck.
  useEffect(() => {
    if (picked === null) return;
    const t = setTimeout(() => {
      if (dogStopped) { setGame('bowls'); chooseMode('me'); }
      else again();
    }, 2000);
    return () => clearTimeout(t);
  }, [picked, dogStopped, again, chooseMode]);

  // In "Dog picks" mode the dog keeps hunting on its own: whenever the board is
  // idle it goes in again after a short beat. No re-tapping the toggle — switch
  // to "I'll pick" to stop. Pauses once the goal is reached.
  useEffect(() => {
    if (mode !== 'dog' || dogStopped || picked !== null || sniffing) return;
    const t = setTimeout(() => sniff(), 550);
    return () => clearTimeout(t);
  }, [mode, dogStopped, picked, sniffing, sniff]);

  const pct = Math.min(100, (points / REWARD_GOAL) * 100);

  // The prompt above the board — shown as an eye-catching pill so players know
  // what to do next.
  const hint = done
    ? ''
    : sniffing
      ? 'Sniff… sniff… 🐾'
      : mode === 'dog'
        ? 'Your dog is on the hunt 🐾'
        : game === 'bowls'
          ? 'Tap a bowl — which one is your dog sniffing at?'
          : 'Tap a hand — which one is the treat in?';

  return (
    <div className="min-h-screen bg-warm-50">
      <PageHead
        title="Pet Play — Games for you & your dog | HiSpike"
        description="Play with your dog on HiSpike — Treat Hunt (find the treat under three bowls) and Pick a Hand (guess which hand it's in). Simple games you play together, with points as you go."
        path="/pet-play"
      />


      {/* shared artwork */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="nwBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4574C" /><stop offset="45%" stopColor="#E13B33" /><stop offset="100%" stopColor="#AE2018" />
          </linearGradient>
          <linearGradient id="nwRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF7466" /><stop offset="100%" stopColor="#D0332A" />
          </linearGradient>
          <radialGradient id="nwHole" cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#54100B" /><stop offset="100%" stopColor="#2B0605" />
          </radialGradient>
          <linearGradient id="nwBiscG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="44">
            <stop offset="0%" stopColor="#F3CB93" /><stop offset="52%" stopColor="#DCA765" /><stop offset="100%" stopColor="#B87F3F" />
          </linearGradient>
          <linearGradient id="nwBiscW" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="44">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="52%" stopColor="#F2EFE8" /><stop offset="100%" stopColor="#D3CDC1" />
          </linearGradient>
          <symbol id="nw-biscuit-g" viewBox="0 0 100 44">
            <g fill="url(#nwBiscG)">
              <rect x="19" y="13" width="62" height="18" rx="9" />
              <circle cx="20" cy="12.5" r="11.5" /><circle cx="20" cy="31.5" r="11.5" />
              <circle cx="80" cy="12.5" r="11.5" /><circle cx="80" cy="31.5" r="11.5" />
            </g>
            <circle cx="43" cy="22" r="2.5" fill="#A16E33" opacity=".55" />
            <circle cx="57" cy="22" r="2.5" fill="#A16E33" opacity=".55" />
          </symbol>
          <symbol id="nw-biscuit-w" viewBox="0 0 100 44">
            <g fill="url(#nwBiscW)">
              <rect x="19" y="13" width="62" height="18" rx="9" />
              <circle cx="20" cy="12.5" r="11.5" /><circle cx="20" cy="31.5" r="11.5" />
              <circle cx="80" cy="12.5" r="11.5" /><circle cx="80" cy="31.5" r="11.5" />
            </g>
            <circle cx="43" cy="22" r="2.5" fill="#9E978A" opacity=".5" />
            <circle cx="57" cy="22" r="2.5" fill="#9E978A" opacity=".5" />
          </symbol>
          <symbol id="nw-bowl" viewBox="0 0 200 142">
            <path d="M10 36 C12 80 22 114 36 126 C50 138 150 138 164 126 C178 114 188 80 190 36 Z" fill="url(#nwBody)" />
            <path d="M150 46 C154 80 148 106 137 120 C147 122 157 117 163 111 C176 97 184 68 186 44 Z" fill="#FF8C7E" opacity=".42" />
            <g fill="#fff" opacity=".96">
              <ellipse cx="100" cy="95" rx="17" ry="13.5" />
              <ellipse cx="80" cy="75" rx="7.4" ry="9.4" /><ellipse cx="94" cy="68" rx="7.4" ry="9.8" />
              <ellipse cx="110" cy="68" rx="7.4" ry="9.8" /><ellipse cx="122" cy="76" rx="7.4" ry="9.4" />
            </g>
            <ellipse cx="100" cy="36" rx="90" ry="25" fill="url(#nwRim)" />
            <ellipse cx="100" cy="34" rx="72" ry="17" fill="url(#nwHole)" />
          </symbol>
          <symbol id="nw-spark" viewBox="0 0 24 24">
            <path d="M12 0 C13.2 8.4 15.6 10.8 24 12 C15.6 13.2 13.2 15.6 12 24 C10.8 15.6 8.4 13.2 0 12 C8.4 10.8 10.8 8.4 12 0 Z" fill="currentColor" />
          </symbol>

          {/* Pick a Hand uses emoji fists (✊ → 🖐 on reveal), not SVG — see render. */}
        </defs>
      </svg>

      {/* Hero — shown on arrival for the page identity, then collapses a few
          seconds later (or the moment you play) so the board gets the room. */}
      <div
        className="overflow-hidden transition-all duration-700 ease-in-out motion-reduce:transition-none"
        style={{ maxHeight: heroHidden ? 0 : 420, opacity: heroHidden ? 0 : 1 }}
        aria-hidden={heroHidden}
      >
        <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
          <HeroPaws />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🦴</span>
            <div className="flex-1">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
                Pet Play · Play together
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">Games for you &amp; your dog</h1>
              <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
              <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
                Two quick games — find the treat, or pick the right hand. Play together and rack up points.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* pick a game */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex gap-1 bg-white border border-warm-200 rounded-full p-1" role="group" aria-label="Choose a game">
            {([['bowls', '🥣 Treat Hunt'], ['hands', '✋ Pick a Hand']] as [Game, string][]).map(([g, label]) => (
              <button
                key={g}
                type="button"
                onClick={() => switchGame(g)}
                aria-pressed={game === g}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  game === g ? 'bg-accent-400 text-warm-900 shadow' : 'text-warm-500 hover:text-warm-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* who picks */}
        <div className="flex justify-center">
          <div className="inline-flex gap-1 bg-white border border-warm-200 rounded-full p-1" role="group" aria-label="Who picks">
            {([['me', "🙋 I'll pick"], ['dog', '🐕 Dog picks']] as [Mode, string][]).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => chooseMode(m)}
                aria-pressed={mode === m}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  mode === m ? 'bg-primary-600 text-white shadow' : 'text-warm-500 hover:text-warm-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* instruction sits with the toggles, above the board — a bold accent
            pill so the player's eye lands on the next action */}
        <div className="flex justify-center mt-3 min-h-[40px]">
          {hint && (
            <span
              key={hint}
              className={`nw-cta inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-extrabold shadow-sm ${
                sniffing
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-accent-100 text-accent-800 border border-accent-300'
              }`}
            >
              {hint}
            </span>
          )}
        </div>

        {/* board */}
        <div className="nw-board mt-2">
          {STARS.map((s, i) => (
            <svg
              key={i}
              className={`nw-spark${s.gold ? ' gold' : ''}`}
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ top: s.top, [s.side]: s.off, width: s.w, animationDelay: s.d } as React.CSSProperties}
            >
              <use href="#nw-spark" />
            </svg>
          ))}

          <div className="nw-rug" aria-hidden="true" />

          <div className={`nw-dog${sniffing ? ' sniff' : ''}`}>
            <span className="nw-dogwrap">
              <img
                className={`nw-dogphoto${pawUp ? ' is-hidden' : ''}`}
                src="/spike/messi-sit.png"
                alt="Messi, a golden retriever puppy, waiting to sniff out the treat"
              />
              {/* second frame stacked on top; both share a canvas so only the paw moves */}
              <img
                className={`nw-dogphoto nw-frame2${pawUp ? '' : ' is-hidden'}`}
                src="/spike/messi-paw.png"
                alt=""
                aria-hidden="true"
              />
            </span>
          </div>

          <div className={`nw-bowls${game === 'hands' ? ' hands' : ''}`}>
            {Array.from({ length: CHOICES[game] }).map((_, i) => {
              const isWin = done && i === picked;
              const isDim = done && i !== picked;
              const waiting = !done && mode === 'dog';
              return (
                <div
                  key={i}
                  className={`nw-slot${game === 'hands' ? ' hand' : ''}${done ? ' done' : ''}${isWin ? ' win' : ''}${isDim ? ' dim' : ''}${waiting ? ' waiting' : ''}`}
                >
                  <button
                    type="button"
                    className="nw-bowlbtn"
                    aria-label={ARIA[game][i]}
                    disabled={done || mode === 'dog'}
                    onClick={() => pick(i)}
                  >
                    <span className="nw-glow" />
                    <span className="nw-contact" />
                    <span className="nw-bones">
                      {PILE.map((b, k) => (
                        <svg
                          key={k}
                          className="nw-bone"
                          viewBox="0 0 100 44"
                          aria-hidden="true"
                          style={{
                            left: `${b.l}%`, top: `${b.t}%`,
                            ['--r' as string]: b.r, ['--s' as string]: b.s, ['--d' as string]: `${(k * 0.035).toFixed(3)}s`,
                          } as React.CSSProperties}
                        >
                          <use href={`#nw-biscuit-${b.c}`} />
                        </svg>
                      ))}
                    </span>
                    {game === 'bowls' ? (
                      <svg className="nw-bowlsvg" viewBox="0 0 200 142" aria-hidden="true"><use href="#nw-bowl" /></svg>
                    ) : (
                      <span className="nw-handemoji" aria-hidden="true">
                        <span className="nw-fistE">✊</span>
                        <span className="nw-palmE">🖐</span>
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* result / actions */}
        <div className="text-center mt-3 min-h-[56px]" aria-live="polite">
          {done ? (
            <>
              {/* headline and points share a row — stacking them pushed the whole
                  block past the fold on laptop and small phones */}
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <p className="text-lg sm:text-xl font-extrabold text-green-600">🎉 Nailed it! Good dog.</p>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-sm font-extrabold text-accent-700 tabular-nums">
                  ★ +{gain} pts
                </p>
              </div>
              {/* say so explicitly, or the counter appears to lose the points */}
              {hitGoal && (
                <p className="mt-1.5 text-sm font-bold text-green-600">
                  🏆 You hit {REWARD_GOAL} points! The counter starts over.
                </p>
              )}
              {dogStopped ? (
                <button
                  type="button"
                  onClick={playAgain}
                  className="mt-2 rounded-full bg-accent-400 hover:bg-accent-300 px-7 py-2.5 text-sm font-bold text-warm-900 shadow transition-colors"
                >
                  ▶ Play again
                </button>
              ) : (
                <p className="mt-2 text-xs text-warm-400">Next round coming up…</p>
              )}
            </>
          ) : null}
        </div>

        {/* session points */}
        <div className="mt-2 rounded-2xl border border-warm-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-sm text-warm-900">Points this session</p>
            <p className="text-xs font-bold text-warm-500 tabular-nums">{points} / {REWARD_GOAL}</p>
          </div>
          <div className="h-3 rounded-full bg-warm-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-warm-500 text-center">
            Just for fun right now — points reset when you leave. Gift-card rewards are coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
