import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { PROFILE } from '../data';
import { ResumeLink } from './ResumeViewer';
import { Magnetic } from './Magnetic';
import { StretchWord } from './StretchWord';

const ease = [0.2, 0.8, 0.2, 1] as const;
const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.5 + i * 0.1, ease } }),
};

/**
 * The name and the cube are the one loud thing on the page; everything else
 * here stays quiet: one sentence about what I do, and two ways forward.
 */
export const Hero = () => {
  const reduce = useReducedMotion();
  const init = reduce ? false : 'hidden';

  return (
    <section id="top" className="relative px-5 md:px-10">
      <div className="mx-auto flex min-h-[100svh] max-w-page flex-col pb-10 pt-20 md:pb-14">
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
          <motion.p
            variants={fade}
            initial={init}
            animate="show"
            custom={0}
            className="max-w-xl text-lg leading-snug text-paper/80 md:col-span-7 md:text-xl"
          >
            {PROFILE.intro}
          </motion.p>

          <motion.div
            variants={fade}
            initial={init}
            animate="show"
            custom={1}
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
                See my work
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
