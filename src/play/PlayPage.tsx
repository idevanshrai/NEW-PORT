import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-600.css';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { findSecret, on, track } from '../lib/bus';
import { navigate } from '../lib/router';
import { PixelIcon, type IconName } from './icons';
import { PanelBody, PxButton } from './Panels';
import { isMuted, setMuted, sfx } from './sound';
import { BIOMES } from './world';
import { cam, hud, input, isMoveKey, look, player, releaseAll, requests, resetPlay, setFpp, setKey, zoom } from './controls';
import type { BiomeId } from './world';
import type { BlockType } from './textures';
import { react, resetReactions, type Reaction } from './reactions';

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

const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const HINT_KEY = 'dr:play-hint';

/** Touch: a thumbstick bottom-left. Writes straight into the shared input. */
function Joystick({ onUse }: { onUse: () => void }) {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const id = useRef<number | null>(null);
  const move = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    input.joyX = x;
    input.joyY = -y;
    player.target = null;
    knob.current!.style.transform = `translate(${x * 34}px, ${y * 34}px)`;
  };
  const end = () => {
    id.current = null;
    input.joyX = input.joyY = 0;
    if (knob.current) knob.current.style.transform = ''; // also runs on unmount, when the knob is gone
  };
  useEffect(() => end, []);
  return (
    <div
      ref={base}
      aria-hidden
      className="absolute bottom-[140px] left-5 h-28 w-28 touch-none rounded-full border-[3px] border-black/60 bg-black/30"
      onPointerDown={(e) => {
        id.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        onUse();
        move(e);
      }}
      onPointerMove={(e) => e.pointerId === id.current && move(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div ref={knob} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full border-[3px] border-black/60 bg-white/75" />
    </div>
  );
}

/* Byte, Devansh's drone, guides you through the world in the chat. */
const GUIDE: Record<BiomeId, string> = {
  profile: 'This is Devansh: software developer, final-year CS at VIT, interning at IBM. Each island is a part of his story.',
  skills: 'Server Room. The languages and tools he works with, and how deep he goes in each.',
  projects: 'Crystal Mine. The chest holds his projects; the outlined ones have full write-ups.',
  journey: 'Frost Peak. From robotics in 2017 to agentic AI at IBM. Pull up a log by the fire.',
  achievements: 'Glow Caverns. Awards, competitions, and every secret you have found so far.',
  certs: 'Dune Archive. His certificates, signed and stamped. Open one to read it.',
  now: 'Blossom Hill. What he is busy with this month.',
  contact: 'Last stop! The mailbox sends him an email, and he replies fast.',
};
type Chat = { id: number; text: string };
const ITEM_NAMES: Partial<Record<BlockType, string>> = {
  log: 'Log', leaves: 'Leaves', blossom: 'Blossom', crystal: 'Crystal', violet: 'Violet crystal', crate: 'Crate',
  rack: 'Server rack', cactus: 'Cactus', planks: 'Planks', lantern: 'Lantern', mail: 'Mailbox', stone: 'Stone',
};
let chatSeq = 0;

type Toast = { id: number; title: string };
let toastSeq = 0;

export default function PlayPage() {
  const [slot, setSlot] = useState(0); // the island you're standing on (0–7)
  const [near, setNear] = useState<number | null>(null); // landmark within reach
  const [panelId, setPanelId] = useState(0);
  const [menu, setMenu] = useState(false);
  const [panelOpen, setPanelOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const visitedRef = useRef(visited);
  const [night, setNight] = useState(false);
  const [muted, setMute] = useState(isMuted);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState<string | null>(BIOMES[0].place);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hint, setHint] = useState(false);
  const [touch] = useState(isTouch);
  const [locked, setLocked] = useState(false); // mouse captured for looking around
  const [fpp, setFppState] = useState(false);
  const [chat, setChat] = useState<Chat[]>([]);
  const broken = useRef(0);
  const bag = useRef<Partial<Record<BlockType, number>>>({});
  const [pickup, setPickup] = useState<{ id: number; text: string } | null>(null);
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const time = useIndiaTime();
  const biome = BIOMES[slot];
  const panel = BIOMES[panelId];
  const nextUnvisited = BIOMES.findIndex((_, i) => !visited.has(i));

  // timers that must not fire after leaving play mode (toasts, chat lines, secrets)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  useEffect(() => {
    // a fresh world each visit: camera, player clocks, cooldowns and quality start over
    resetPlay();
    resetReactions();
    document.title = 'Play — Devansh Rai';
    track('play_open');
    const pending = timers.current;
    return () => {
      document.title = 'Devansh Rai — Software Developer';
      pending.forEach(clearTimeout);
      pending.clear();
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

  // first visit: how to move (hidden as soon as you do)
  useEffect(() => {
    if (!loaded) return;
    let seen = false;
    try {
      seen = !!localStorage.getItem(HINT_KEY);
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* private mode */
    }
    if (seen) return;
    setHint(true);
    const id = setTimeout(() => setHint(false), 9000);
    return () => clearTimeout(id);
  }, [loaded]);

  // show site-wide toasts (secrets etc.) as "advancement" pop-ups here
  const advancement = useCallback((title: string) => {
    const id = ++toastSeq;
    setToasts((t) => [...t.slice(-2), { id, title }]);
    sfx('advance');
    later(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, [later]);
  useEffect(() => on('dr:toast', (m) => advancement(m.replace(/^✳\s*/, ''))), [advancement]);

  const say = useCallback((text: string) => {
    const id = ++chatSeq;
    setChat((c) => [...c.slice(-3), { id, text }]);
    later(() => setChat((c) => c.filter((x) => x.id !== id)), 12000);
  }, [later]);

  const openPanel = useCallback((n: number) => {
    // reading needs the mouse back
    if (document.pointerLockElement) document.exitPointerLock();
    setPanelId(n);
    setPanelOpen(true);
    setMenu(false);
    sfx('open');
  }, []);

  // the guide says hello
  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      say(`Hi, I'm Byte, Devansh's drone. ${touch ? 'Drag to look, use the stick to walk' : 'Click to look around, WASD to walk'}, and follow the green beams.`);
      say(GUIDE.profile);
    }, 600);
    return () => clearTimeout(id);
  }, [loaded, say, touch]);

  const onReact = useCallback((r: Reaction) => react(r, say), [say]);
  const onBreak = useCallback(() => {
    broken.current++;
    if (broken.current === 1) say('Nice swing. Trees, crystals and crates break; the islands themselves stay put.');
    if (broken.current === 50) onReact('breaks50');
    track('play_break', { n: broken.current });
  }, [say, onReact]);
  const onPickup = useCallback((t: BlockType) => {
    const n = (bag.current[t] ?? 0) + 1;
    bag.current[t] = n;
    setPickup({ id: Date.now(), text: `+1 ${ITEM_NAMES[t] ?? 'Block'}  (${n})` });
  }, []);
  useEffect(() => {
    if (!pickup) return;
    const id = setTimeout(() => setPickup(null), 1600);
    return () => clearTimeout(id);
  }, [pickup]);

  // ── events from the 3D world ──
  const onIsland = useCallback(
    (n: number) => {
      setSlot(n);
      setFlash(BIOMES[n].place);
      if (visitedRef.current.has(n)) return;
      const next = new Set(visitedRef.current).add(n);
      visitedRef.current = next;
      setVisited(next);
      track('play_discover', { island: BIOMES[n].id });
      say(GUIDE[BIOMES[n].id]);
      later(() => advancement(`Discovered ${BIOMES[n].place}`), 500);
      if (next.size === BIOMES.length) later(() => findSecret('explorer'), 2500);
    },
    [advancement, say, later],
  );
  const onNear = useCallback((n: number | null) => {
    setNear(n);
    if (n === null) setPanelOpen(false); // walked away: put the panel away
  }, []);

  const interact = useCallback(() => {
    if (near === null) return;
    if (panelOpen && panelId === near) setPanelOpen(false);
    else openPanel(near);
  }, [near, panelOpen, panelId, openPanel]);

  // hotbar: fast travel to an island and open its panel
  const select = useCallback(
    (n: number) => {
      if (n === MENU) {
        releaseAll();
        setMenu((m) => !m);
        sfx('open');
        return;
      }
      requests.travel = n;
      openPanel(n);
      sfx('select');
      track('play_slot', { slot: BIOMES[n].id });
    },
    [openPanel],
  );

  // the scene reads these every frame
  useEffect(() => {
    hud.compassTarget = nextUnvisited;
    hud.panelOpen = panelOpen && !menu;
  }, [nextUnvisited, panelOpen, menu]);

  // keyboard: WASD / arrows to walk, Space to jump, E to open, 1–8 fast travel, Esc menu
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat && !isMoveKey(e.key)) return; // holding E / a digit / Esc must not toggle over and over
      // Esc closes whatever is on top: the menu, then an open screen, otherwise opens the menu
      if (e.key === 'Escape') return menu ? setMenu(false) : panelOpen ? setPanelOpen(false) : select(MENU);
      if (panelOpen && !/^[1-9eE]$/.test(e.key)) return; // reading: the world waits
      if (menu) return;
      if (/^[1-9]$/.test(e.key)) return select(Number(e.key) - 1);
      if (e.key.toLowerCase() === 'e') return interact();
      if (e.key.toLowerCase() === 'v') {
        setFpp(!cam.fpp);
        setFppState(cam.fpp);
        return;
      }
      if (setKey(e.key, true)) {
        e.preventDefault();
        setHint(false);
      }
    };
    const up = (e: KeyboardEvent) => setKey(e.key, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', releaseAll);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', releaseAll);
    };
  }, [select, interact, menu, panelOpen]);
  useEffect(() => {
    if (panelOpen) releaseAll(); // stop walking when a screen opens
  }, [panelOpen]);
  // desktop: click the world to capture the mouse, then move it to look around
  useEffect(() => {
    const onLock = () => {
      const on = document.pointerLockElement === stage.current;
      setLocked(on);
      if (on) setHint(false);
    };
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement === stage.current) look(e.movementX * 0.0022, e.movementY * 0.0022);
    };
    const onDown = (e: MouseEvent) => {
      if (document.pointerLockElement === stage.current && e.button === 0) {
        requests.use = true;
        input.mine = true;
      }
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 0) input.mine = false;
    };
    document.addEventListener('mouseup', onUp);
    document.addEventListener('pointerlockchange', onLock);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('pointerlockchange', onLock);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, []);
  useEffect(() => {
    if (menu && document.pointerLockElement) document.exitPointerLock();
  }, [menu]);

  // phones: drag anywhere on the world to look around
  const touchLook = useRef<{ id: number; x: number; y: number; moved: number } | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTouch = (e: React.PointerEvent) => {
    if (touchLook.current && e.pointerId !== touchLook.current.id) return; // another finger lifted
    touchLook.current = null;
    input.mine = false;
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  // let go of every key only when leaving play mode — not each time the listener above re-subscribes
  // (it does whenever a landmark comes into reach, and that must not stop you mid-stride)
  useEffect(
    () => () => {
      if (pressTimer.current) clearTimeout(pressTimer.current); // a long-press in progress must not start mining next visit
      releaseAll();
    },
    [],
  );

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
      <div
        ref={stage}
        className="absolute inset-0 touch-none"
        onClick={() => {
          if (!touch && !menu && !document.pointerLockElement) stage.current?.requestPointerLock()?.catch?.(() => {});
        }}
        onWheel={(e) => {
          zoom(e.deltaY * 0.01);
          setFppState(cam.fpp);
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== 'touch' || touchLook.current) return; // keep following the first finger
          touchLook.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
          if (pressTimer.current) clearTimeout(pressTimer.current);
          pressTimer.current = setTimeout(() => {
            if (touchLook.current && touchLook.current.moved < 10) input.mine = true;
          }, 280);
        }}
        onPointerMove={(e) => {
          const tl = touchLook.current;
          if (!tl || tl.id !== e.pointerId) return;
          tl.moved += Math.abs(e.clientX - tl.x) + Math.abs(e.clientY - tl.y);
          look((e.clientX - tl.x) * 0.006, (e.clientY - tl.y) * 0.006);
          tl.x = e.clientX;
          tl.y = e.clientY;
        }}
        onPointerUp={endTouch}
        onPointerCancel={endTouch}
      >
        <Suspense fallback={null}>
          <PlayScene
            night={night}
            onReady={() => setReady(true)}
            onIsland={onIsland}
            onNear={onNear}
            onArrive={openPanel}
            onBreak={onBreak}
            onReact={onReact}
            onPickup={onPickup}
          />
        </Suspense>
      </div>

      {/* crosshair while aiming */}
      {loaded && (locked || fpp || touch) && !menu && !panelOpen && (
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -ml-[9px] -mt-[9px] h-[18px] w-[18px] mix-blend-difference">
          <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white" />
          <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white" />
        </div>
      )}

      {/* chat: Byte the drone narrates as you explore */}
      <div className="pointer-events-none absolute left-3 right-3 top-[146px] flex flex-col gap-1 md:bottom-5 md:left-5 md:right-auto md:top-auto md:w-[min(420px,calc(50vw-285px))]">
        <AnimatePresence initial={false}>
          {chat.slice(touch ? -2 : -4).map((c) => (
            <motion.p
              key={c.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="bg-black/50 px-2 py-1 text-[12px] leading-snug md:text-[13px]"
            >
              <span className="text-[#c8ff2e]">&lt;Byte&gt;</span> {c.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* desktop: how to start looking around */}
      {loaded && !touch && !locked && !menu && !hint && (
        <p className="px-text-shadow pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap text-[12px] text-white/70">
          Click the world to look around · V first person · Esc to free the mouse
        </p>
      )}

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

      {/* ── the screen for the landmark you opened: a book or a container ── */}
      <AnimatePresence>
        {loaded && panelOpen && !menu && (
          <motion.div
            key="screen"
            className="absolute inset-0 z-20 grid place-items-center bg-black/45 p-2 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            onClick={() => setPanelOpen(false)}
          >
            <motion.div
              key={panel.id}
              role="dialog"
              aria-label={panel.title}
              initial={reduce ? false : { opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <PanelBody
                id={panel.id}
                close={() => setPanelOpen(false)}
                next={() => select(Math.min(panelId + 1, BIOMES.length - 1))}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* picked up a block */}
      <AnimatePresence>
        {pickup && (
          <motion.p
            key={pickup.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-text-shadow pointer-events-none absolute bottom-[188px] left-1/2 -translate-x-1/2 whitespace-pre text-[14px] text-[#ffe9a8]"
          >
            {pickup.text}
          </motion.p>
        )}
      </AnimatePresence>

      {/* walk up to a glowing block → open it */}
      {loaded && near !== null && !menu && !(panelOpen && panelId === near) && (
        <button
          onClick={interact}
          className={`px-btn absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 text-[13px] ${touch ? 'top-[104px]' : 'bottom-[150px]'}`}
        >
          {touch ? 'Tap to open' : '[E] Open'} {BIOMES[near].title}
        </button>
      )}

      {/* compass to the next island you haven't seen */}
      {loaded && nextUnvisited >= 0 && !menu && (
        <div className="px-text-shadow pointer-events-none absolute left-1/2 top-[64px] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[12px] md:top-5 md:text-[13px]">
          <span ref={(el) => void (hud.compass = el)} className="inline-block text-[#c8ff2e]">
            ▲
          </span>
          <span>Next: {BIOMES[nextUnvisited].place}</span>
        </div>
      )}

      {/* touch controls (put away while a panel covers the bottom of a phone screen) */}
      {loaded && touch && !menu && !panelOpen && (
        <>
          <Joystick onUse={() => setHint(false)} />
          <button
            aria-label="Jump"
            className="px-btn absolute bottom-[160px] right-5 grid h-16 w-16 touch-none place-items-center text-[12px]"
            onPointerDown={() => (input.jump = true)}
            onPointerUp={() => (input.jump = false)}
            onPointerCancel={() => (input.jump = false)}
            onPointerLeave={() => (input.jump = false)}
          >
            Jump
          </button>
        </>
      )}

      <AnimatePresence>
        {hint && loaded && !menu && (
          <div className="pointer-events-none absolute inset-x-0 top-[34%] flex justify-center px-4">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-panel px-4 py-3 text-center text-[13px] leading-relaxed"
            >
              {touch ? (
                <>
                  Stick to walk · drag to look
                  <br />
                  Tap a glowing block to go to it · hold to chop
                </>
              ) : (
                <>
                  Click to look around · WASD to walk
                  <br />
                  Shift sprint · Space jump · V first person
                  <br />
                  Hold click on a tree to chop it · E to open · 1–8 fast travel
                </>
              )}
            </motion.p>
          </div>
        )}
      </AnimatePresence>

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
              <PxButton
                onClick={() => {
                  if (!night) onReact('night');
                  setNight((n) => !n);
                }}
              >
                Time: {night ? 'Night' : 'Day'}
              </PxButton>
              <PxButton onClick={toggleSound}>Sound: {muted ? 'Off' : 'On'}</PxButton>
              <PxButton onClick={exit}>Back to the Website</PxButton>
              <p className="mt-3 text-[11px] leading-relaxed text-white/60">
                {touch
                  ? 'Stick: walk · Drag: look · Hold: chop · Tap a glowing block: go there · Hotbar: fast travel'
                  : 'Mouse: look · WASD: walk · Shift: sprint · Space: jump · V: first person · Scroll: zoom · Hold click: chop · Click: open · E: open · 1–8: fast travel · Esc: menu'}
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
      <div className="pointer-events-none absolute right-3 top-14 z-10 flex flex-col gap-2 md:right-5 md:top-16">
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
                <span className="block text-[12px] text-[#ffcf3a]">Achievement unlocked!</span>
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
              <p className="mt-6 text-[11px] text-white/45">Tip: click to look around, WASD to walk, 1–8 to fast travel</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
