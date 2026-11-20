import { useEffect, useState, type ReactNode } from 'react';
import { AWARDS, CERTIFICATES, EDUCATION, EXPERIENCE, LAB, NOW, PROFILE, SKILLS, WORK, type Project } from '../data';
import { foundSecrets, SECRETS } from '../lib/bus';
import { copyEmail } from '../lib/commands';
import { openResume } from '../lib/docs';
import { navigate } from '../lib/router';
import { ago, useGitHub } from '../lib/useGitHub';
import { DocLink } from '../components/ResumeViewer';
import { PixelIcon, type IconName } from './icons';
import { sfx } from './sound';
import type { BiomeId } from './world';

/*
 * The info screens. Each landmark opens the kind of screen its object would have
 * in a block game: books you flip through (profile, journey, now, contact) and
 * containers with item slots (skills, projects, achievements, certificates).
 */

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
const fine = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
const narrowScreen = () => typeof window !== 'undefined' && window.innerWidth < 768;
const hide = (s: string) => !import.meta.env.DEV && s.startsWith('TODO');

export const PxButton = ({ children, onClick, className = '' }: { children: ReactNode; onClick: () => void; className?: string }) => (
  <button
    onClick={() => {
      sfx('click');
      onClick();
    }}
    className={`px-btn px-4 py-2 font-pixel text-sm ${className}`}
  >
    {children}
  </button>
);

const BookButton = ({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button
    disabled={disabled}
    onClick={() => {
      sfx('click');
      onClick();
    }}
    className="px-book-btn px-3 py-1.5 font-pixel text-[14px]"
  >
    {children}
  </button>
);

const Close = ({ onClick, dark }: { onClick: () => void; dark?: boolean }) => (
  <button
    onClick={onClick}
    aria-label="Close"
    className={`font-pixel text-[18px] leading-none ${dark ? 'text-[#2a1a0c]/60 hover:text-[#2a1a0c]' : 'text-[#fff1d6]/70 hover:text-white'}`}
  >
    ✕
  </button>
);

/* ── Book: pages in spreads of two (one on phones), flipped with arrows ── */
function BookScreen({ title, pages, close }: { title: string; pages: ReactNode[]; close: () => void }) {
  const [narrow] = useState(narrowScreen);
  const per = narrow ? 1 : 2;
  const count = Math.ceil(pages.length / per);
  const [spread, setSpread] = useState(0);
  const flip = (d: number) => {
    const n = Math.min(count - 1, Math.max(0, spread + d));
    if (n === spread) return;
    sfx('page');
    setSpread(n);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') flip(1);
      if (e.key === 'ArrowLeft') flip(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const shown = pages.slice(spread * per, spread * per + per);
  while (shown.length < per) shown.push(null);
  return (
    <div className="px-book flex max-h-[88svh] w-[min(94vw,840px)] flex-col font-pixel">
      <header className="flex items-center justify-between px-6 pt-5">
        <h2 className="text-[20px] text-[#7a3e12]">{title}</h2>
        <Close onClick={close} dark />
      </header>
      <div className="px-spread grid min-h-0 flex-1 md:grid-cols-2">
        {shown.map((pg, i) => (
          <section
            key={`${spread}-${i}`}
            data-scroll
            data-lenis-prevent
            className="px-page min-h-[min(56svh,420px)] overflow-y-auto px-6 py-4 text-[15px] leading-relaxed md:px-8"
          >
            {pg}
          </section>
        ))}
      </div>
      <footer className="flex items-center justify-between px-6 pb-5 pt-2">
        <BookButton onClick={() => flip(-1)} disabled={spread === 0}>
          ◀
        </BookButton>
        <span className="text-[13px] text-[#3b2a17]/60">
          {count > 1 ? `Page ${spread * per + 1}${per > 1 && pages.length > spread * per + 1 ? `–${spread * per + 2}` : ''} of ${pages.length}` : ''}
        </span>
        <BookButton onClick={() => flip(1)} disabled={spread >= count - 1}>
          ▶
        </BookButton>
      </footer>
    </div>
  );
}

/* ── Container: a wooden frame around stone slots ── */
function ContainerScreen({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return (
    <div className="px-chest flex max-h-[88svh] w-[min(94vw,600px)] flex-col font-pixel">
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h2 className="px-text-shadow text-[19px] text-[#fff1d6]">{title}</h2>
        <Close onClick={close} />
      </header>
      <div data-scroll data-lenis-prevent className="px-chest-inner mx-4 mb-4 min-h-0 overflow-y-auto p-3 text-[#1e1e24]">
        {children}
      </div>
    </div>
  );
}

/** Details for the slot under the cursor (desktop) or the last one tapped (touch). */
type Tip = { title: string; lines: string[]; action?: string } | null;
function useTip() {
  const [tip, setTip] = useState<Tip>(null);
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [floating] = useState(fine);
  const bind = (t: NonNullable<Tip>) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (!floating) return;
      setTip(t);
      setAt({ x: e.clientX, y: e.clientY });
      sfx('pop');
    },
    onPointerMove: (e: React.PointerEvent) => floating && setAt({ x: e.clientX, y: e.clientY }),
    onPointerLeave: () => floating && setTip(null),
    onFocus: () => setTip(t),
  });
  const view = tip ? (
    floating && at ? (
      <div
        className="px-tooltip pointer-events-none fixed z-50 max-w-[300px] px-3 py-2 font-pixel text-[13px] text-white"
        style={{ left: Math.min(at.x + 16, window.innerWidth - 316), top: at.y + 16 }}
      >
        <p className="text-[15px] text-[#c8ff2e]">{tip.title}</p>
        {tip.lines.map((l) => (
          <p key={l} className="mt-0.5 text-white/85">
            {l}
          </p>
        ))}
        {tip.action && <p className="mt-1 text-white/50">{tip.action}</p>}
      </div>
    ) : (
      <div className="px-tooltip mt-3 px-3 py-2 text-[13px] text-white">
        <p className="text-[15px] text-[#c8ff2e]">{tip.title}</p>
        {tip.lines.map((l) => (
          <p key={l} className="mt-0.5 text-white/85">
            {l}
          </p>
        ))}
      </div>
    )
  ) : null;
  return { bind, view, floating, setTip };
}

/* 1 ── Profile: a book about the player */
function Profile({ close, next }: { close: () => void; next: () => void }) {
  // the same facts the old home-page About section showed, edited in one place (src/data.ts)
  const facts: [string, string][] = [...PROFILE.facts.map((f): [string, string] => [f.k, f.v]), ['Status', 'Online, graduating 2027']];
  return (
    <BookScreen
      title="About the Player"
      close={close}
      pages={[
        <div key="who" className="flex flex-col items-center text-center">
          <div className="mt-2 grid h-28 w-28 place-items-center border-4 border-[#2a1a0c] bg-[#c9b07c]">
            <PixelIcon name="face" size={88} />
          </div>
          <h3 className="mt-4 text-[26px] leading-tight">{PROFILE.name}</h3>
          <p className="text-[#7a3e12]">Software developer</p>
          <p className="mt-4">{PROFILE.intro}</p>
        </div>,
        <div key="stats">
          <h3 className="text-[18px] text-[#7a3e12]">Stats</h3>
          <dl className="mt-3 space-y-2">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b-2 border-dotted border-[#3b2a17]/25 pb-1">
                <dt className="text-[#3b2a17]/60">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <BookButton onClick={openResume}>Read the résumé</BookButton>
            <BookButton onClick={next}>Next island ▶</BookButton>
          </div>
        </div>,
      ]}
    />
  );
}

/* 2 ── Skills: a training table with XP bars */
function Skills({ close }: { close: () => void }) {
  const { bind, view, floating } = useTip();
  return (
    <ContainerScreen title="Skill Tree" close={close}>
      <div className="space-y-1.5">
        {SKILLS.map((s) => (
          <div
            key={s.name}
            tabIndex={0}
            {...bind({ title: `${s.name}, level ${ROMAN[s.tier]}`, lines: [s.note] })}
            className="px-slot grid grid-cols-[2.5rem_1fr] items-center gap-3 px-3 py-2 sm:grid-cols-[2.5rem_1fr_9rem]"
          >
            <span className="px-text-shadow text-center text-[18px] text-[#fff1d6]">{ROMAN[s.tier]}</span>
            <span className="text-[15px] text-[#14141a]">
              {s.name}
              {!floating && <span className="block text-[12px] text-[#14141a]/65">{s.note}</span>}
            </span>
            <span className="col-span-2 flex gap-[2px] border-2 border-[#14141a] bg-[#14141a] p-[2px] sm:col-span-1">
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className={`h-2.5 flex-1 ${n < s.tier * 2 ? 'bg-[#7ee03b]' : 'bg-[#3a3a42]'}`} />
              ))}
            </span>
          </div>
        ))}
      </div>
      {floating && <p className="mt-3 text-[12px] text-[#14141a]/60">Hover a skill to inspect it.</p>}
      {view}
    </ContainerScreen>
  );
}

/* 3 ── Projects: a chest of items */
const iconFor = (p: Project): IconName => {
  const k = `${p.kind} ${p.stack.join(' ')}`.toLowerCase();
  if (k.includes('mcp')) return 'plug';
  if (k.includes('macos') || k.includes('swift')) return p.name === 'Contrail' ? 'plane' : 'window';
  if (k.includes('robot') || k.includes('arduino')) return 'robot';
  if (k.includes('vision') || k.includes('cnn') || k.includes('opencv')) return 'eye';
  if (k.includes('asr') || k.includes('speech')) return 'wave';
  if (k.includes('ml')) return 'brain';
  return 'globe';
};

function Chest({ close }: { close: () => void }) {
  const items = [...WORK, ...LAB];
  const { bind, view, floating, setTip } = useTip();
  const [picked, setPicked] = useState<Project | null>(null);
  const open = (p: Project) => {
    sfx('select');
    if (p.slug) navigate(`/work/${p.slug}`);
    else window.open(p.live ?? p.repo, '_blank', 'noopener');
  };
  const tipFor = (p: Project) => ({
    title: `${p.name}`,
    lines: [`${p.kind}, ${p.year}`, p.blurb, p.stack.join(' · ')],
    action: p.slug ? 'Click to read the case study' : 'Click to open',
  });
  return (
    <ContainerScreen title="Chest: Projects" close={close}>
      <div className="grid grid-cols-5 gap-1 sm:grid-cols-9">
        {Array.from({ length: 18 }).map((_, i) => {
          const p = items[i];
          return (
            <button
              key={i}
              disabled={!p}
              {...(p ? bind(tipFor(p)) : {})}
              onClick={() => {
                if (!p) return;
                if (floating) return open(p);
                // touch: first tap shows the details, the button below opens it
                setPicked(p);
                setTip(tipFor(p));
                sfx('pop');
              }}
              aria-label={p?.name ?? 'empty slot'}
              className={`px-slot relative grid aspect-square place-items-center ${p ? 'cursor-pointer hover:brightness-110' : ''} ${
                i < WORK.length ? 'px-glint' : ''
              }`}
            >
              {p && <PixelIcon name={iconFor(p)} size={30} />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-[#14141a]/60">
        Shiny items are featured and have a full write-up. {floating ? 'Hover to inspect, click to open.' : 'Tap to inspect.'}
      </p>
      {view}
      {!floating && picked && (
        <div className="mt-2">
          <PxButton onClick={() => open(picked)}>{picked.slug ? 'Read the case study' : 'Open'} ▶</PxButton>
        </div>
      )}
    </ContainerScreen>
  );
}

/* 4 ── Journey: a book, one chapter per step, oldest first */
function Journey({ close }: { close: () => void }) {
  const start = (period: string) => Number(period.match(/\d{4}/)?.[0] ?? 0);
  const steps = [
    ...EDUCATION.map((e) => ({ when: e.period, title: e.school, sub: e.what, points: [] as string[] })),
    ...EXPERIENCE.map((e) => ({ when: e.period, title: e.org, sub: e.role, points: e.points.filter((p) => !hide(p)) })),
  ].sort((a, b) => start(a.when) - start(b.when));
  return (
    <BookScreen
      title="The Journey"
      close={close}
      pages={steps.map((s, i) => (
        <div key={s.title}>
          <p className="text-[13px] text-[#3b2a17]/55">
            Chapter {i + 1} · {s.when}
          </p>
          <h3 className="mt-1 text-[22px] leading-tight">{s.title}</h3>
          <p className="text-[#7a3e12]">{s.sub}</p>
          {s.points.length > 0 && (
            <ul className="mt-4 space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-[#7a3e12]">◆</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    />
  );
}

/* 5 ── Achievements: trophies and secrets */
function Achievements({ close }: { close: () => void }) {
  const have = foundSecrets();
  const all = Object.keys(SECRETS) as (keyof typeof SECRETS)[];
  const { bind, view, floating } = useTip();
  return (
    <ContainerScreen title="Achievements" close={close}>
      <p className="text-[14px] text-[#14141a]">Awards</p>
      <div className="mt-1.5 grid grid-cols-5 gap-1 sm:grid-cols-9">
        {AWARDS.map((a) => (
          <button
            key={a.what + a.where}
            {...bind({ title: a.what, lines: [a.where + (a.year ? `, ${a.year}` : '')] })}
            aria-label={a.what}
            className="px-slot px-glint grid aspect-square place-items-center"
          >
            <PixelIcon name="trophy" size={30} />
          </button>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-[#14141a]">
        Secrets found: {have.length} of {all.length}
      </p>
      <div className="mt-1.5 grid grid-cols-5 gap-1 sm:grid-cols-9">
        {all.map((k) => {
          const got = have.includes(k);
          return (
            <button
              key={k}
              {...bind(got ? { title: 'Secret found', lines: [SECRETS[k]] } : { title: '???', lines: ['Keep exploring the site to find this one.'] })}
              aria-label={got ? SECRETS[k] : 'Locked secret'}
              className={`px-slot grid aspect-square place-items-center ${got ? '' : 'opacity-60'}`}
            >
              {got ? <PixelIcon name="compass" size={28} /> : <span className="px-text-shadow text-[18px] text-[#fff1d6]">?</span>}
            </button>
          );
        })}
      </div>
      {!floating && (
        <ul className="mt-3 space-y-1 text-[13px] text-[#14141a]">
          {AWARDS.map((a) => (
            <li key={a.what + a.where}>
              🏆 {a.what}, {a.where}
            </li>
          ))}
        </ul>
      )}
      {view}
    </ContainerScreen>
  );
}

/* 6 ── Certificates: framed on the wall */
function Certs({ close }: { close: () => void }) {
  return (
    <ContainerScreen title="Certificates" close={close}>
      <div className="grid gap-3 sm:grid-cols-2">
        {CERTIFICATES.map((c) => (
          <DocLink
            key={c.file}
            doc={{ url: c.file, title: `${c.title} — ${c.issuer}`, filename: c.file.split('/').pop()! }}
            className="group block"
          >
            <div className="border-[6px] border-[#6b4a2a] bg-[#4a3118] p-1.5 shadow-[inset_0_0_0_2px_#a37a4a] transition group-hover:brightness-110">
              {c.thumb ? (
                <img src={c.thumb} alt="" className="aspect-[1.414] w-full bg-white object-cover" />
              ) : (
                <div className="grid aspect-[1.414] place-items-center bg-[#efe2bf]">
                  <PixelIcon name="scroll" size={44} />
                </div>
              )}
            </div>
            <p className="mt-2 text-[15px] text-[#14141a]">{c.title}</p>
            <p className="text-[13px] text-[#14141a]/65">
              {c.issuer}, {c.date}
            </p>
            <span className="text-[13px] text-[#14141a] underline">Inspect ▶</span>
          </DocLink>
        ))}
      </div>
    </ContainerScreen>
  );
}

/* 7 ── Now: a journal page */
function NowBook({ close }: { close: () => void }) {
  const gh = useGitHub();
  const items = NOW.items.filter((i) => !hide(i.v));
  return (
    <BookScreen
      title="Right Now"
      close={close}
      pages={[
        <div key="month">
          <p className="text-[13px] text-[#3b2a17]/55">Journal, {NOW.updated}</p>
          <dl className="mt-3 space-y-3">
            {items.map((i) => (
              <div key={i.k}>
                <dt className="text-[#7a3e12]">{i.k}</dt>
                <dd>{i.v}</dd>
              </div>
            ))}
          </dl>
        </div>,
        <div key="live">
          <h3 className="text-[18px] text-[#7a3e12]">Latest activity</h3>
          {gh?.latest ? (
            <p className="mt-3">
              Last pushed code to{' '}
              <a href={gh.latest.url} target="_blank" rel="noopener" className="underline decoration-2 underline-offset-4">
                {gh.latest.name}
              </a>{' '}
              {ago(gh.latest.pushedAt)}.
            </p>
          ) : (
            <p className="mt-3">Out building something. Check back soon.</p>
          )}
          <p className="mt-6 text-[13px] text-[#3b2a17]/60">This page is updated every month or so.</p>
        </div>,
      ]}
    />
  );
}

/* 8 ── Contact: a letter with wax seals */
function Letter({ close }: { close: () => void }) {
  const seal = (label: string, onClick: () => void) => (
    <button
      onClick={() => {
        sfx('click');
        onClick();
      }}
      className="px-seal px-4 py-2 font-pixel text-[13px]"
    >
      {label}
    </button>
  );
  return (
    <BookScreen
      title="A Letter"
      close={close}
      pages={[
        <div key="letter">
          <p>Dear visitor,</p>
          <p className="mt-3">
            Thanks for exploring my world. If you've got an internship, a full-time role, or a project you think I'd enjoy, I'd love
            to hear about it.
          </p>
          <p className="mt-3">Email is the fastest way to reach me.</p>
          <p className="mt-5 text-[#7a3e12]">— Devansh</p>
        </div>,
        <div key="send" className="flex flex-col items-center text-center">
          <p className="text-[13px] text-[#3b2a17]/55">Write to</p>
          <p className="mt-1 break-all text-[20px]">{PROFILE.email}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {seal('Send a message', () => window.location.assign(`mailto:${PROFILE.email}`))}
            {seal('Copy email', copyEmail)}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {seal('GitHub', () => window.open(PROFILE.github, '_blank', 'noopener'))}
            {seal('LinkedIn', () => window.open(PROFILE.linkedin, '_blank', 'noopener'))}
            {seal('Résumé', openResume)}
          </div>
        </div>,
      ]}
    />
  );
}

export function PanelBody({ id, next, close }: { id: BiomeId; next: () => void; close: () => void }) {
  switch (id) {
    case 'profile':
      return <Profile close={close} next={next} />;
    case 'skills':
      return <Skills close={close} />;
    case 'projects':
      return <Chest close={close} />;
    case 'journey':
      return <Journey close={close} />;
    case 'achievements':
      return <Achievements close={close} />;
    case 'certs':
      return <Certs close={close} />;
    case 'now':
      return <NowBook close={close} />;
    case 'contact':
      return <Letter close={close} />;
  }
}
