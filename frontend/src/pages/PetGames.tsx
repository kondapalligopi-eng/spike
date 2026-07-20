import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHead } from '@/components/PageHead';

// Nose Work: Treat Hunt — a treat is hidden in one of three bowls and the dog
// (or the owner) picks. Front-end only for now: points are a local session
// tally, and gift-card redemption is intentionally not live until scoring
// moves server-side. See the "Rewards" note at the bottom of the page.

type Mode = 'me' | 'dog';

const ARIA = ['Left bowl', 'Middle bowl', 'Right bowl'];
const WHERE = ['the left bowl', 'the middle bowl', 'the right bowl'];

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

export function PetGames() {
  const [mode, setMode] = useState<Mode>('me');
  const [treat, setTreat] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [sniffing, setSniffing] = useState(false);
  const [points, setPoints] = useState(0);
  const [gain, setGain] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pick the hiding place on the client only — during SSG there is no randomness.
  useEffect(() => {
    setTreat(Math.floor(Math.random() * 3));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const done = picked !== null;
  const found = done && picked === treat;

  const pick = useCallback((i: number) => {
    setPicked((prev) => {
      if (prev !== null) return prev;
      const hit = i === treat;
      const g = hit ? 30 + Math.floor(Math.random() * 31) : 5 + Math.floor(Math.random() * 11);
      setGain(g);
      setPoints((p) => p + g);
      return i;
    });
  }, [treat]);

  const sniff = useCallback(() => {
    if (done || sniffing) return;
    setSniffing(true);
    timer.current = setTimeout(() => {
      setSniffing(false);
      pick(Math.floor(Math.random() * 3));
    }, 1250);
  }, [done, sniffing, pick]);

  const again = useCallback(() => {
    setPicked(null);
    setGain(0);
    setTreat(Math.floor(Math.random() * 3));
  }, []);

  const pct = Math.min(100, (points / REWARD_GOAL) * 100);

  return (
    <div className="min-h-screen bg-warm-50">
      <PageHead
        title="Pet Games — Treat Hunt | HiSpike"
        description="Play Treat Hunt with your dog on HiSpike. Hide a treat in one of three bowls and let your dog sniff out the right one — a nose-work game you play together."
        path="/pet-games"
      />

      <style>{`
        .nw-board{position:relative;border-radius:22px;padding:22px 12px 44px;overflow:hidden;
          background:
            radial-gradient(72% 68% at 0% 0%,   #1E45B4 0%, rgba(30,69,180,0) 62%),
            radial-gradient(74% 70% at 100% 2%, #8A2F9E 0%, rgba(138,47,158,0) 62%),
            radial-gradient(72% 72% at 0% 100%, #0E8489 0%, rgba(14,132,137,0) 62%),
            radial-gradient(76% 68% at 100% 100%, #9C7524 0%, rgba(156,117,36,0) 60%),
            #111731;
          box-shadow:inset 0 2px 0 rgba(255,255,255,.14),0 16px 34px -18px #0C1128}
        .nw-spark{position:absolute;color:#fff;pointer-events:none;z-index:1;
          filter:drop-shadow(0 0 6px rgba(255,255,255,.6));animation:nwTw 3.2s ease-in-out infinite}
        .nw-spark.gold{color:#F7B518;filter:drop-shadow(0 0 7px rgba(247,181,24,.75))}
        @keyframes nwTw{0%,100%{opacity:.28;transform:scale(.8)}50%{opacity:1;transform:scale(1.12)}}
        .nw-rug{position:absolute;left:5%;right:5%;bottom:26px;height:124px;border-radius:50%;z-index:0;
          background:radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.24),rgba(255,255,255,.09) 54%,transparent 76%);
          box-shadow:0 0 0 1.5px rgba(255,255,255,.10) inset}
        .nw-dog{position:relative;z-index:5;display:flex;justify-content:center;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
        .nw-dog::after{content:"";position:absolute;bottom:4px;left:50%;transform:translateX(-50%);z-index:0;
          width:clamp(66px,17vw,98px);height:15px;border-radius:50%;
          background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,.5),rgba(0,0,0,.2) 50%,transparent 74%)}
        .nw-dog.sniff{animation:nwSniff 1.2s ease-in-out}
        @keyframes nwSniff{0%,100%{transform:translateY(0) rotate(0)}
          25%{transform:translateY(10px) rotate(-6deg)}55%{transform:translateY(12px) rotate(7deg)}80%{transform:translateY(6px) rotate(-3deg)}}
        .nw-dogphoto{position:relative;z-index:1;display:block;height:clamp(118px,29vw,168px);width:auto;
          filter:drop-shadow(0 12px 11px rgba(0,0,0,.45))}
        .nw-bowls{position:relative;z-index:2;display:flex;justify-content:center;align-items:flex-end;
          gap:clamp(10px,4vw,26px);margin-top:22px;padding:0 4px}
        .nw-slot{position:relative;flex:1;max-width:140px;display:flex;flex-direction:column;align-items:center}
        .nw-bowlbtn{position:relative;width:100%;border:0;background:transparent;padding:0;cursor:pointer;display:block}
        .nw-bowlbtn:disabled{cursor:default}
        .nw-bowlbtn:focus-visible{outline:none}
        .nw-bowlbtn:focus-visible .nw-bowlsvg{outline:3px solid #F7B518;outline-offset:5px;border-radius:12px}
        .nw-bones{position:absolute;left:8%;right:8%;top:-13px;height:30px;z-index:3;pointer-events:none}
        .nw-bone{position:absolute;width:clamp(26px,8.2vw,42px);height:auto;opacity:0;
          transform:translateY(20px) rotate(var(--r)) scale(.25);
          transition:transform .5s cubic-bezier(.34,1.7,.5,1),opacity .28s;transition-delay:var(--d,0s);
          filter:drop-shadow(0 2px 2px rgba(0,0,0,.42))}
        .nw-slot.win .nw-bone{opacity:1;transform:translateY(0) rotate(var(--r)) scale(var(--s))}
        .nw-glow{position:absolute;left:-8%;right:-8%;bottom:0;height:80px;border-radius:50%;z-index:0;opacity:0;
          background:radial-gradient(ellipse at 50% 50%,rgba(247,181,24,.7),rgba(247,181,24,.2) 45%,transparent 72%);
          transition:opacity .5s}
        .nw-slot.win .nw-glow{opacity:1}
        .nw-contact{position:absolute;left:4%;right:4%;bottom:-6px;height:18px;border-radius:50%;z-index:1;
          background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,.55),rgba(0,0,0,.28) 45%,transparent 72%);
          transition:transform .35s,opacity .35s}
        .nw-slot:not(.done) .nw-bowlbtn:hover .nw-contact{transform:scale(.9);opacity:.7}
        .nw-slot.miss .nw-contact{opacity:.35}
        .nw-bowlsvg{position:relative;z-index:2;width:100%;height:auto;display:block;
          filter:drop-shadow(0 10px 10px rgba(0,0,0,.32));
          transition:transform .35s cubic-bezier(.34,1.5,.5,1),opacity .3s}
        .nw-slot:not(.done) .nw-bowlbtn:hover .nw-bowlsvg{transform:translateY(-7px) scale(1.04)}
        .nw-slot.waiting .nw-bowlsvg{animation:nwWiggle 1.15s ease-in-out infinite}
        .nw-slot.waiting:nth-child(2) .nw-bowlsvg{animation-delay:.16s}
        .nw-slot.waiting:nth-child(3) .nw-bowlsvg{animation-delay:.32s}
        @keyframes nwWiggle{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-7px) rotate(1.5deg)}}
        .nw-slot.win .nw-bowlsvg{animation:nwHop .55s cubic-bezier(.34,1.5,.5,1)}
        @keyframes nwHop{0%{transform:translateY(0)}35%{transform:translateY(-14px)}70%{transform:translateY(0)}85%{transform:translateY(-5px)}100%{transform:translateY(0)}}
        .nw-slot.miss .nw-bowlsvg{opacity:.4;transform:scale(.95)}
        @media (prefers-reduced-motion:reduce){.nw-board *{animation:none!important;transition-duration:.01ms!important}}
      `}</style>

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
        </defs>
      </svg>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🦴</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Pet Games · Nose Work
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">Treat Hunt</h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Hide a treat in one of three bowls, then let your dog sniff out the right one — a game you play together.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* who picks */}
        <div className="flex justify-center">
          <div className="inline-flex gap-1 bg-white border border-warm-200 rounded-full p-1" role="group" aria-label="Who picks the bowl">
            {([['me', "🙋 I'll pick"], ['dog', '🐕 Dog picks']] as [Mode, string][]).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
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

        {/* board */}
        <div className="nw-board mt-5">
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
            <img className="nw-dogphoto" src="/spike/messi.png" alt="Messi, a golden retriever puppy, waiting to sniff out the treat" />
          </div>

          <div className="nw-bowls">
            {[0, 1, 2].map((i) => {
              const isWin = done && i === treat;
              const isMiss = done && i === picked && !found;
              const waiting = !done && mode === 'dog';
              return (
                <div
                  key={i}
                  className={`nw-slot${done ? ' done' : ''}${isWin ? ' win' : ''}${isMiss ? ' miss' : ''}${waiting ? ' waiting' : ''}`}
                >
                  <button
                    type="button"
                    className="nw-bowlbtn"
                    aria-label={ARIA[i]}
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
                    <svg className="nw-bowlsvg" viewBox="0 0 200 142" aria-hidden="true"><use href="#nw-bowl" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* result / actions */}
        <div className="text-center mt-6 min-h-[104px]" aria-live="polite">
          {done ? (
            <>
              <p className={`text-xl font-extrabold ${found ? 'text-green-600' : 'text-warm-900'}`}>
                {found ? '🎉 Nailed it! Good dog.' : `So close! It was in ${WHERE[treat]}.`}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent-100 px-4 py-1.5 text-sm font-extrabold text-accent-700 tabular-nums">
                ★ +{gain} pts
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={again}
                  className="rounded-full bg-primary-600 hover:bg-primary-700 px-7 py-3 text-sm font-bold text-white transition-colors"
                >
                  Hide another treat ↻
                </button>
              </div>
            </>
          ) : sniffing ? (
            <p className="text-warm-500">Sniff… sniff… 🐽</p>
          ) : mode === 'dog' ? (
            <>
              <p className="text-warm-500 mb-3">Ready? Send your dog in to sniff out the treat.</p>
              <button
                type="button"
                onClick={sniff}
                className="rounded-full bg-accent-400 hover:bg-accent-300 px-7 py-3 text-sm font-bold text-warm-900 shadow transition-colors"
              >
                Let your dog sniff 🐽
              </button>
            </>
          ) : (
            <p className="text-warm-500">Tap a bowl — which one is your dog sniffing at?</p>
          )}
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
