import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-600.css';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { findSecret, on, track } from '../lib/bus';
import { navigate } from '../lib/router';
import { PixelIcon, type IconName } from './icons';
import { PanelBody, PxButton } from './Panels';
import { isMuted, setMuted, sfx } from './sound';
import { BIOMES } from './world';

const PlayScene = lazy(() => import('./PlayScene'));

const SLOT_ICONS: IconName[] = ['face', 'chip', 'chest', 'compass', 'trophy', 'scroll', 'clock', 'mail', 'gear'];
const SLOT_NAMES = [...BIOMES.map((b) => b.title), 'Game Menu'];
const MENU = 8;

function useIndiaTime() {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

type Toast = { id: number; title: string };
let toastSeq = 0;

export default function PlayPage() {
  const [slot, setSlot] = useState(0); // which island (0–7)
  const [menu, setMenu] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [night, setNight] = useState(false);
  const [muted, setMute] = useState(isMuted);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState<string | null>(SLOT_NAMES[0]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const time = useIndiaTime();
  const wheelAt = useRef(0);
  const biome = BIOMES[slot];

  useEffect(() => {
    document.title = 'Play — Devansh Rai';
    track('play_open');
    return () => {
      document.title = 'Devansh Rai — Software Developer';
    };
  }, []);

  // loading screen: wait for the 3D world, then a beat so the bar can finish
  // never leave someone stuck on the loading screen on a slow device
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => {
      setLoaded(true);
      findSecret('played');
    }, 900);
    return () => clearTimeout(id);
  }, [ready]);

  // show site-wide toasts (secrets etc.) as "advancement" pop-ups here
  const advancement = useCallback((title: string) => {
    const id = ++toastSeq;
    setToasts((t) => [...t.slice(-2), { id, title }]);
    sfx('advance');
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  useEffect(() => on('dr:toast', (m) => advancement(m.replace(/^✳\s*/, ''))), [advancement]);

  const select = useCallback(
    (n: number) => {
      if (n === MENU) {
        setMenu((m) => !m);
        sfx('open');
        return;
      }
      setMenu(false);
      setPanelOpen(true);
      if (n === slot) return;
      sfx('select');
      setSlot(n);
      setFlash(SLOT_NAMES[n]);
      track('play_slot', { slot: BIOMES[n].id });
      if (!visited.has(n)) {
        const next = new Set(visited).add(n);
        setVisited(next);
        setTimeout(() => advancement(`Discovered ${BIOMES[n].place}`), 1400);
        if (next.size === BIOMES.length) setTimeout(() => findSecret('explorer'), 3000);
      }
    },
    [slot, visited, advancement],
  );

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(id);
  }, [flash]);

  // keyboard + mouse wheel, like a game hotbar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (/^[1-9]$/.test(e.key)) select(Number(e.key) - 1);
      else if (e.key === 'Escape') select(MENU);
      else if (e.key === 'ArrowRight') select((slot + 1) % BIOMES.length);
      else if (e.key === 'ArrowLeft') select((slot + BIOMES.length - 1) % BIOMES.length);
      else if (e.key.toLowerCase() === 'e') select(2); // "inventory" → projects chest
    };
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-scroll]')) return;
      const now = performance.now();
      if (now - wheelAt.current < 350 || Math.abs(e.deltaY) < 8) return;
      wheelAt.current = now;
      select((slot + (e.deltaY > 0 ? 1 : BIOMES.length - 1)) % BIOMES.length);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
    };
  }, [select, slot]);

  const toggleSound = () => {
    setMuted(!muted);
    setMute(!muted);
  };
  const exit = () => {
    sfx('click');
    navigate('/');
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0b0d12] font-pixel text-white">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <PlayScene slot={slot} night={night} onReady={() => setReady(true)} />
        </Suspense>
      </div>

      {/* soft vignette so the HUD reads well over bright skies */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.38)_100%)]" />

      {/* ── HUD: top-left readout ─────────────────────────────── */}
      <div className="px-text-shadow pointer-events-none absolute left-3 top-3 text-[12px] leading-tight md:left-5 md:top-5 md:text-[14px]">
        <p>
          Devansh Builds <span className="text-[#ffcf3a]">v1.0</span>
        </p>
        <p>
          Biome: <span className="text-[#c8ff2e]">{biome.place}</span>
        </p>
        <p className="text-white/80">India · {time} IST</p>
      </div>

      {/* ── HUD: top-right buttons ─────────────────────────────── */}
      <div className="absolute right-3 top-3 flex gap-2 text-[12px] md:right-5 md:top-5">
        <button onClick={toggleSound} className="px-btn px-2.5 py-1.5" aria-label={muted ? 'Sound on' : 'Sound off'}>
          {muted ? '♪ off' : '♪ on'}
        </button>
        <button onClick={() => select(MENU)} className="px-btn hidden px-2.5 py-1.5 sm:block">
          Esc · Menu
        </button>
        <button onClick={exit} className="px-btn px-2.5 py-1.5">
          Exit ✕
        </button>
      </div>

      {/* ── the panel for the current island ─────────────────────── */}
      <AnimatePresence>
        {loaded && panelOpen && !menu && (
          <motion.section
            key={biome.id}
            initial={{ opacity: 0, x: -24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="px-panel absolute inset-x-3 bottom-[118px] max-h-[44svh] md:bottom-auto md:left-6 md:right-auto md:top-24 md:max-h-[calc(100svh-15rem)] md:w-[460px]"
            aria-label={biome.title}
          >
            <header className="flex items-center justify-between border-b-2 border-black/60 px-4 py-2.5">
              <h1 className="px-text-shadow text-[17px] md:text-[19px]">{biome.title}</h1>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-white/50">[{biome.slot}]</span>
                <button onClick={() => setPanelOpen(false)} className="text-white/60 hover:text-white" aria-label="Hide panel">
                  ✕
                </button>
              </div>
            </header>
            <div data-scroll data-lenis-prevent className="max-h-[calc(44svh-52px)] overflow-y-auto px-4 py-3 font-sans md:max-h-[calc(100svh-15rem-52px)]">
              <PanelBody id={biome.id} next={() => select(Math.min(slot + 1, BIOMES.length - 1))} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {loaded && !panelOpen && !menu && (
        <button onClick={() => setPanelOpen(true)} className="px-btn absolute left-3 top-24 px-3 py-1.5 text-[12px] md:left-6">
          Show panel
        </button>
      )}

      {/* ── game menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {menu && (
          <motion.div
            className="absolute inset-0 z-20 grid place-items-center bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenu(false)}
          >
            <div className="flex w-[300px] flex-col gap-3 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="px-text-shadow mb-2 text-2xl">Game Menu</p>
              <PxButton onClick={() => setMenu(false)}>Back to Game</PxButton>
              <PxButton onClick={() => setNight((n) => !n)}>Time: {night ? 'Night' : 'Day'}</PxButton>
              <PxButton onClick={toggleSound}>Sound: {muted ? 'Off' : 'On'}</PxButton>
              <PxButton onClick={exit}>Back to the Website</PxButton>
              <p className="mt-3 text-[11px] leading-relaxed text-white/60">
                1–8 or scroll: switch islands · E: projects · Esc: menu
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── bottom HUD: hearts, XP, hotbar ─────────────────────── */}
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center md:bottom-5">
        <AnimatePresence>
          {flash && (
            <motion.p
              key={flash}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-text-shadow mb-2 text-[15px]"
            >
              {flash}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="w-[min(94vw,520px)]">
          <div className="flex items-end justify-between px-0.5">
            <div className="flex gap-[2px]">
              {Array.from({ length: 10 }).map((_, i) => (
                <PixelIcon key={i} name="heart" size={14} />
              ))}
            </div>
            <span className="px-text-shadow text-[13px] text-[#c8ff2e]">{visited.size}</span>
            <span className="w-[150px] text-right text-[10px] text-white/60">{visited.size}/8 explored</span>
          </div>
          <div className="mt-1 h-[7px] border-2 border-black bg-[#1a1a1f]">
            <div className="h-full bg-[#7ee03b] transition-[width] duration-700" style={{ width: `${(visited.size / BIOMES.length) * 100}%` }} />
          </div>
          <nav className="mt-1.5 flex justify-center gap-[3px] border-[3px] border-black bg-black/60 p-[3px]" aria-label="Hotbar">
            {SLOT_ICONS.map((ic, i) => {
              const active = i === MENU ? menu : i === slot && !menu;
              return (
                <button
                  key={ic}
                  onClick={() => select(i)}
                  aria-label={`${i + 1}: ${SLOT_NAMES[i]}`}
                  title={`${i + 1} · ${SLOT_NAMES[i]}`}
                  className={`px-slot-dark relative grid aspect-square flex-1 place-items-center ${
                    active ? 'outline outline-[3px] outline-offset-0 outline-white' : ''
                  }`}
                >
                  <span className="absolute left-1 top-0.5 text-[9px] text-white/60">{i + 1}</span>
                  <PixelIcon name={ic} size={26} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── advancement pop-ups ───────────────────────────────── */}
      <div className="pointer-events-none absolute right-3 top-14 z-30 flex flex-col gap-2 md:right-5 md:top-16">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 340 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="px-panel flex w-[280px] items-center gap-3 px-3 py-2.5"
            >
              <span className="px-slot grid h-10 w-10 shrink-0 place-items-center">
                <PixelIcon name="trophy" size={26} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] text-[#ffcf3a]">Advancement made!</span>
                <span className="block truncate font-sans text-[13px]">{t.title}</span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── loading screen ────────────────────────────────────── */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="absolute inset-0 z-40 grid place-items-center bg-[#15130f]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-[min(80vw,360px)] text-center">
              <p className="px-text-shadow text-2xl">Devansh Builds</p>
              <p className="mt-6 text-[14px] text-white/80">{ready ? 'Building terrain…' : 'Generating world…'}</p>
              <div className="mt-3 h-3 border-2 border-black bg-[#2a2a2a]">
                <motion.div
                  className="h-full bg-[#7ee03b]"
                  initial={{ width: '5%' }}
                  animate={{ width: ready ? '100%' : '70%' }}
                  transition={{ duration: ready ? 0.8 : 4, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-6 text-[11px] text-white/45">Tip: press 1–8 to jump between islands</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
