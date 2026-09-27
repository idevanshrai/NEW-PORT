import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PROFILE } from '../data';
import { ResumeLink } from './ResumeViewer';
import { Magnetic } from './Magnetic';
import { emit } from '../lib/bus';
import { Scramble } from './Scramble';
import { StretchWord } from './StretchWord';

function useIndiaTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const ease = [0.2, 0.8, 0.2, 1] as const;
const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.5 + i * 0.1, ease } }),
};

// Things I actually build — each one backed by work further down the page
const BUILDS = [
  'agentic AI systems',
  'offline speech-to-notes',
  'MCP servers for Claude',
  'computer-vision tools',
  'robots (since 2017)',
];

export const Hero = () => {
  const time = useIndiaTime();
  const reduce = useReducedMotion();
  const init = reduce ? false : 'hidden';

  return (
    <section id="top" className="relative px-5 md:px-10">
      <div className="mx-auto flex min-h-[100svh] max-w-page flex-col pb-6 pt-20 md:pb-8">
        {/* Top row */}
        <motion.div
          variants={fade}
          initial={init}
          animate="show"
          custom={0}
          className="flex items-center justify-between gap-4"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-lime" />
            </span>
            <span className="sm:hidden">Now at IBM</span>
            <span className="hidden sm:inline">Now — Agentic AI @ IBM India Software Labs</span>
          </p>
          <span className="label">India — {time} IST</span>
        </motion.div>

        {/* Name, with the cube living in the gap between the two words */}
        <div className="flex flex-1 items-center justify-center py-8">
          <h1
            aria-label={PROFILE.name}
            className="display flex select-none flex-col items-center whitespace-nowrap text-[21vw] text-paper md:flex-row md:gap-[1.5vw] md:text-[12.5vw] xl:text-[11.5rem]"
          >
            <StretchWord text="Devansh" className="whitespace-nowrap" />
            {/* Scene3D reads this box's position and drops the Rubik's cube into it */}
            <span
              id="hero-stage"
              aria-hidden
              title="Click me"
              className="order-first mb-2 block h-[34svh] w-full cursor-pointer md:order-none md:mb-0 md:h-[0.9em] md:w-[0.95em]"
            />
            <span className="whitespace-nowrap">
              <StretchWord text="Rai" delay={0.35} />
              <span className="font-serif font-normal italic tracking-normal text-lime">.</span>
            </span>
          </h1>
        </div>

        {/* What I do + actions */}
        <div className="grid items-end gap-8 md:grid-cols-12">
          <motion.div variants={fade} initial={init} animate="show" custom={1} className="md:col-span-7">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-mute">
              <span className="text-lime">❯</span> I build{' '}
              <span className="text-paper">
                <Scramble phrases={BUILDS} />
              </span>
              <span className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-pulse bg-lime" />
            </p>
            <p className="mt-4 max-w-xl text-lg leading-snug text-paper/80 md:text-xl">{PROFILE.intro}</p>
          </motion.div>

          <motion.div
            variants={fade}
            initial={init}
            animate="show"
            custom={2}
            className="flex flex-wrap items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] md:col-span-5 md:justify-end"
          >
            <Magnetic>
              <ResumeLink className="block bg-lime px-5 py-3 text-onlime">View résumé</ResumeLink>
            </Magnetic>
            <Magnetic>
              <a
                href="#work"
                className="block border border-line px-5 py-3 text-paper transition-colors duration-300 hover:border-paper"
              >
                See my work ↓
              </a>
            </Magnetic>
          </motion.div>
        </div>

        {/* Bottom row */}
        <motion.div
          variants={fade}
          initial={init}
          animate="show"
          custom={3}
          className="mt-10 flex items-center justify-between border-t border-line pt-4 label"
        >
          <span className="flex gap-5 text-paper">
            <a className="link-underline" href={PROFILE.github} target="_blank" rel="noopener">
              GitHub
            </a>
            <a className="link-underline" href={PROFILE.linkedin} target="_blank" rel="noopener">
              LinkedIn
            </a>
            <a className="link-underline" href={`mailto:${PROFILE.email}`}>
              Email
            </a>
          </span>
          <span className="hidden items-center gap-4 md:flex">
            <a href="/play" className="bg-lime px-2 py-1 text-onlime">
              ▶ Press P to play
            </a>
            <button onClick={() => emit('dr:palette', 'open')} className="transition-colors hover:text-paper">
              ⌘K · ` · click the cube
            </button>
          </span>
          <span>Graduating 2027</span>
        </motion.div>
      </div>
    </section>
  );
};
