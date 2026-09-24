import { WORK } from '../data';
import { Reveal, SectionLabel } from './Reveal';

export const Work = () => (
  <section id="work" className="relative px-5 py-28 md:px-10 md:py-40">
    <div className="mx-auto max-w-page md:pr-[22vw]">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel n="03">Selected work</SectionLabel>
        </div>
        <div className="md:col-span-9">
          <h2 className="display text-6xl text-paper md:text-[8vw]">
            Selected
            <span className="font-serif font-normal italic tracking-normal"> work</span>
          </h2>
          <p className="mt-6 max-w-lg text-mute">Three things I’d happily walk you through line by line.</p>
        </div>
      </div>

      <ul className="mt-16 border-b border-line md:mt-24">
        {WORK.map((p, i) => (
          <Reveal key={p.name} delay={0.05 * i}>
            <li className="group border-t border-line">
              <a
                href={p.live ?? p.repo}
                target="_blank"
                rel="noopener"
                className="grid gap-5 py-10 md:grid-cols-12 md:gap-10 md:py-14"
              >
                <span className="font-mono text-xs text-mute md:col-span-1">0{i + 1}</span>
                <div className="md:col-span-6">
                  <h3 className="display text-6xl text-paper transition-colors duration-300 group-hover:text-lime md:text-6xl xl:text-8xl">
                    {p.name}
                  </h3>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                    {p.kind} — {p.year}
                  </p>
                </div>
                <div className="flex flex-col justify-between gap-6 md:col-span-5">
                  <p className="max-w-md leading-relaxed text-paper/85">{p.blurb}</p>
                  <div className="flex items-end justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                      {p.stack.join(' · ')}
                    </p>
                    <span className="text-3xl text-mute transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-lime">
                      ↗
                    </span>
                  </div>
                </div>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  </section>
);
