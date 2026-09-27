import { useState, type ReactNode } from 'react';
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

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];

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

const Row = ({ k, v }: { k: string; v: ReactNode }) => (
  <div className="flex justify-between gap-4 border-b border-white/10 py-1.5 text-[13px]">
    <span className="text-white/55">{k}</span>
    <span className="text-right text-white">{v}</span>
  </div>
);

/* 1 ── Player profile */
function Profile({ next }: { next: () => void }) {
  return (
    <>
      <div className="flex gap-4">
        <div className="px-slot-dark grid h-24 w-24 shrink-0 place-items-center">
          <PixelIcon name="face" size={72} />
        </div>
        <p className="text-[13px] leading-relaxed text-white/85">{PROFILE.intro}</p>
      </div>
      <div className="mt-4">
        <Row k="Class" v="Software Developer" />
        <Row k="Level" v="Final year · B.Tech CSE (AI/ML)" />
        <Row k="Guild" v="IBM India Software Labs" />
        <Row k="Spawn" v="India" />
        <Row k="Status" v={<span className="text-[#c8ff2e]">● Online — graduating 2027</span>} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PxButton onClick={openResume}>View résumé</PxButton>
        <PxButton onClick={next}>See skills ▶</PxButton>
      </div>
    </>
  );
}

/* 2 ── Skill tree */
function Skills() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <>
      <div className="space-y-1.5">
        {SKILLS.map((s, i) => (
          <div
            key={s.name}
            onPointerEnter={() => {
              setHover(i);
              sfx('pop');
            }}
            onPointerLeave={() => setHover(null)}
            className="px-slot-dark relative grid grid-cols-[2rem_1fr_7rem] items-center gap-3 px-3 py-2"
          >
            <span className="font-pixel text-[#c8ff2e]">{ROMAN[s.tier]}</span>
            <span className="text-[13px] text-white">{s.name}</span>
            <span className="flex gap-[3px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-2.5 flex-1 ${n <= s.tier ? 'bg-[#c8ff2e]' : 'bg-white/10'}`} />
              ))}
            </span>
            {hover === i && (
              <span className="px-tooltip absolute left-full top-0 z-10 ml-3 hidden w-56 px-3 py-2 text-[12px] text-white md:block">
                <span className="block font-pixel text-[#c8ff2e]">{s.name}</span>
                {s.note}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-white/45">Hover a skill to inspect it.</p>
    </>
  );
}

/* 3 ── Projects chest */
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

function Chest() {
  const items = [...WORK, ...LAB];
  const [hover, setHover] = useState<number | null>(null);
  const open = (p: Project) => {
    sfx('select');
    if (p.slug) navigate(`/work/${p.slug}`);
    else window.open(p.live ?? p.repo, '_blank', 'noopener');
  };
  const h = hover !== null ? items[hover] : null;
  return (
    <>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-9">
        {Array.from({ length: 18 }).map((_, i) => {
          const p = items[i];
          return (
            <button
              key={i}
              disabled={!p}
              onPointerEnter={() => p && (setHover(i), sfx('pop'))}
              onPointerLeave={() => setHover(null)}
              onFocus={() => p && setHover(i)}
              onClick={() => p && open(p)}
              aria-label={p?.name ?? 'empty slot'}
              className={`px-slot relative grid aspect-square place-items-center ${p ? 'cursor-pointer hover:brightness-110' : ''} ${
                i < WORK.length ? 'outline outline-2 -outline-offset-4 outline-[#c8ff2e]/60' : ''
              }`}
            >
              {p && <PixelIcon name={iconFor(p)} size={28} />}
            </button>
          );
        })}
      </div>
      <div className="px-tooltip mt-3 min-h-[5.5rem] px-3 py-2 text-[12px] text-white">
        {h ? (
          <>
            <p className="font-pixel text-[15px] text-[#c8ff2e]">
              {h.name} <span className="text-white/50">· {h.kind}, {h.year}</span>
            </p>
            <p className="mt-1 text-white/85">{h.blurb}</p>
            <p className="mt-1 text-white/45">{h.stack.join(' · ')} — click to {h.slug ? 'read the case study' : 'open'}</p>
          </>
        ) : (
          <p className="text-white/50">Hover an item for details. Outlined items have a full case study.</p>
        )}
      </div>
    </>
  );
}

/* 4 ── Journey as crafting recipes */
function Journey() {
  const steps = [
    ...EXPERIENCE.map((e) => ({ when: e.period, title: e.org, sub: e.role, note: e.points[0], icons: ['chip', 'compass', 'trophy'] })),
    ...EDUCATION.map((e) => ({ when: e.period, title: e.school, sub: e.what, note: '', icons: ['scroll', 'clock', 'face'] })),
  ].filter((s) => !s.note?.startsWith('TODO'));
  return (
    <div className="space-y-2">
      {steps.map((s) => (
        <div key={s.title} className="px-slot-dark flex items-center gap-3 p-2">
          <div className="flex gap-1">
            {s.icons.map((ic) => (
              <span key={ic} className="px-slot grid h-8 w-8 place-items-center">
                <PixelIcon name={ic as IconName} size={20} />
              </span>
            ))}
          </div>
          <span className="font-pixel text-white/60">➜</span>
          <div className="min-w-0">
            <p className="font-pixel text-[11px] text-white/50">{s.when}</p>
            <p className="truncate text-[13px] text-white">{s.title}</p>
            <p className="truncate text-[12px] text-white/60">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 5 ── Advancements: real awards + secrets */
function Advancements() {
  const have = foundSecrets();
  const all = Object.keys(SECRETS) as (keyof typeof SECRETS)[];
  return (
    <>
      <div className="space-y-1.5">
        {AWARDS.map((a) => (
          <div key={a.what + a.where} className="px-slot-dark flex items-center gap-3 px-3 py-2">
            <span className="px-slot grid h-9 w-9 shrink-0 place-items-center">
              <PixelIcon name="trophy" size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-[#ffcf3a]">{a.what}</p>
              <p className="text-[12px] text-white/60">
                {a.where}
                {a.year && ` · ${a.year}`}
              </p>
            </div>
            <span className="font-pixel text-[#c8ff2e]">✓</span>
          </div>
        ))}
      </div>
      <p className="mt-4 font-pixel text-[13px] text-white">
        Secrets {have.length}/{all.length}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {all.map((k) => (
          <div key={k} className={`px-slot-dark px-2 py-1.5 text-[11px] ${have.includes(k) ? 'text-white' : 'text-white/35'}`}>
            {have.includes(k) ? `✓ ${SECRETS[k]}` : '??? — keep exploring'}
          </div>
        ))}
      </div>
    </>
  );
}

/* 6 ── Certificates */
function Certs() {
  return (
    <div className="space-y-2">
      {CERTIFICATES.map((c) => (
        <DocLink
          key={c.file}
          doc={{ url: c.file, title: `${c.title} — ${c.issuer}`, filename: c.file.split('/').pop()! }}
          className="px-slot-dark flex items-center gap-3 p-2 hover:outline hover:outline-2 hover:outline-[#c8ff2e]"
        >
          {c.thumb ? (
            <img src={c.thumb} alt="" className="h-14 w-20 shrink-0 bg-white object-cover" />
          ) : (
            <span className="px-slot grid h-14 w-14 place-items-center">
              <PixelIcon name="scroll" size={32} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[13px] text-white">{c.title}</span>
            <span className="block text-[12px] text-white/60">
              {c.issuer} · {c.date}
            </span>
            <span className="font-pixel text-[11px] text-[#c8ff2e]">Inspect ▶</span>
          </span>
        </DocLink>
      ))}
      <p className="pt-1 text-[11px] text-white/45">More loot coming soon.</p>
    </div>
  );
}

/* 7 ── Now */
function NowPanel() {
  const gh = useGitHub();
  return (
    <>
      <p className="font-pixel text-[11px] text-white/50">Updated {NOW.updated}</p>
      <div className="mt-2">
        {NOW.items
          .filter((i) => import.meta.env.DEV || !i.v.startsWith('TODO'))
          .map((i) => (
            <Row key={i.k} k={i.k} v={<span className="max-w-[16rem] inline-block">{i.v}</span>} />
          ))}
        {gh?.latest && (
          <Row
            k="Last push"
            v={
              <a href={gh.latest.url} target="_blank" rel="noopener" className="text-[#c8ff2e] underline">
                {gh.latest.name} · {ago(gh.latest.pushedAt)}
              </a>
            }
          />
        )}
      </div>
    </>
  );
}

/* 8 ── Contact */
function Contact() {
  return (
    <>
      <p className="text-[13px] leading-relaxed text-white/85">
        Internships, full-time roles, or a project you think I’d enjoy — send a message.
      </p>
      <div className="px-slot-dark mt-3 break-all px-3 py-2 font-pixel text-[15px] text-[#c8ff2e]">{PROFILE.email}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PxButton onClick={() => (window.location.href = `mailto:${PROFILE.email}`)}>Send a message</PxButton>
        <PxButton onClick={copyEmail}>Copy email</PxButton>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <PxButton onClick={() => window.open(PROFILE.github, '_blank', 'noopener')}>GitHub</PxButton>
        <PxButton onClick={() => window.open(PROFILE.linkedin, '_blank', 'noopener')}>LinkedIn</PxButton>
        <PxButton onClick={openResume}>Résumé</PxButton>
      </div>
    </>
  );
}

export function PanelBody({ id, next }: { id: BiomeId; next: () => void }) {
  switch (id) {
    case 'profile':
      return <Profile next={next} />;
    case 'skills':
      return <Skills />;
    case 'projects':
      return <Chest />;
    case 'journey':
      return <Journey />;
    case 'achievements':
      return <Advancements />;
    case 'certs':
      return <Certs />;
    case 'now':
      return <NowPanel />;
    case 'contact':
      return <Contact />;
  }
}
