import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { EDUCATION, EXPERIENCE } from '../data';

type Entry = {
  year: string;
  period: string;
  title: string;
  sub: string;
  points: string[];
};

const yearOf = (period: string) => (period.match(/\d{4}/g) ?? ['']).slice(-1)[0];

// Newest first: all roles, then education.
const ENTRIES: Entry[] = [
  ...EXPERIENCE.map((r) => ({
    year: yearOf(r.period),
    period: r.period,
    title: r.org,
    sub: r.role,
    // TODO lines show (in lime) while you run `npm run dev`, never on the live site
    points: r.points.filter((p) => import.meta.env.DEV || !p.startsWith('TODO')),
  })),
  ...EDUCATION.map((e) => ({
    year: e.period.match(/\d{4}/)?.[0] ?? '',
    period: e.period,
    title: e.school,
    sub: e.what,
    points: [],
  })),
];

/** One stop on the timeline. The dot and the big year light up once the lime line reaches them. */
const Stop = ({ e }: { e: Entry }) => {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  // 0 → 1 as this entry travels from the bottom of the screen to ~45% from the top
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 45%'] });
  const lit = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const dotScale = useTransform(lit, [0, 1], [0.6, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [reduce ? 1 : 0.15, 1]);

  return (
    <li ref={ref} className="relative grid gap-4 pb-20 pl-10 md:grid-cols-12 md:gap-10 md:pb-28 md:pl-0">
      {/* Big year — sticks while you read the entry */}
      <div className="md:col-span-3">
        <span className="display relative block text-5xl md:sticky md:top-28 md:text-[7vw] lg:text-[5.5vw]">
          <span className="text-paper/10">{e.year}</span>
          {/* lime copy fades in on top once the rail reaches this stop */}
          <motion.span aria-hidden style={{ opacity: lit }} className="absolute inset-0 text-lime">
            {e.year}
          </motion.span>
        </span>
      </div>

      {/* The dot sits on the rail */}
      <motion.span
        aria-hidden
        style={{ scale: dotScale }}
        className="absolute left-[3px] top-3 h-3 w-3 rounded-full bg-line ring-4 ring-ink md:left-[calc(25%-6px)] md:top-6"
      >
        <motion.span style={{ opacity: lit }} className="absolute inset-0 rounded-full bg-lime" />
      </motion.span>

      <motion.div style={{ x, opacity }} className="md:col-span-9 md:pl-12">
        <p className="text-sm text-mute">{e.period}</p>
        <h3 className="mt-3 text-3xl font-medium text-paper md:text-5xl">{e.title}</h3>
        <p className="mt-2 text-lg text-mute">{e.sub}</p>
        {e.points.length > 0 && (
          <ul className="mt-6 max-w-2xl space-y-3 leading-relaxed text-paper/85">
            {e.points.map((p) => (
              <li key={p} className={p.startsWith('TODO') ? 'text-lime' : 'flex gap-3'}>
                {!p.startsWith('TODO') && <span className="mt-[0.7em] h-px w-3 shrink-0 bg-mute" />}
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </li>
  );
};

export const Experience = () => {
  const list = useRef<HTMLOListElement>(null);
  // Rail fills from the first stop to the last as you scroll through the section
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 45%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section id="experience" className="relative overflow-x-clip px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-page lg:pr-[22vw]">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 className="display text-6xl text-paper md:col-span-12 md:text-[8vw]">
            Where I’ve
            <br />
            <span className="font-serif font-normal italic tracking-normal">been</span>
          </h2>
        </div>

        <ol ref={list} className="relative mt-20 md:mt-28">
          {/* Rail: grey track + lime fill driven by scroll */}
          <span aria-hidden className="absolute bottom-20 left-[8px] top-4 w-px bg-line md:left-[25%]" />
          <motion.span
            aria-hidden
            style={{ scaleY: fill }}
            className="absolute bottom-20 left-[8px] top-4 w-px origin-top bg-lime md:left-[25%]"
          />
          {ENTRIES.map((e) => (
            <Stop key={e.title} e={e} />
          ))}
        </ol>
      </div>
    </section>
  );
};
