import { LAB } from '../data';
import { Reveal } from './Reveal';

/**
 * Smaller builds as a grid of cards, so this section doesn't read like
 * yet another bordered list after Experience and Work.
 * Borders: the grid draws the top/left edge, each card its own right/bottom,
 * so a half-empty last row never leaves stray lines.
 */
export const Lab = () => (
  <section id="lab" className="relative px-5 py-28 md:px-10 md:py-40">
    <div className="mx-auto max-w-page lg:pr-[22vw]">
      <div className="grid gap-10 md:grid-cols-12">
        <h2 className="display text-6xl text-paper md:col-span-12 md:text-[8vw]">
          Smaller
          <span className="font-serif font-normal italic tracking-normal"> builds</span>
        </h2>
      </div>

      <ul className="mt-16 grid border-l border-t border-line sm:grid-cols-2 xl:grid-cols-4 md:mt-24">
        {LAB.map((p, i) => (
          <li key={p.name} className="border-b border-r border-line">
            <Reveal delay={0.04 * (i % 4)} className="h-full">
              <a
                href={p.live ?? p.repo}
                target="_blank"
                rel="noopener"
                className="group flex h-full flex-col gap-3 p-6 transition-colors duration-300 hover:bg-char"
              >
                <h3 className="text-2xl text-paper transition-colors group-hover:text-lime">{p.name}</h3>
                <p className="text-sm leading-relaxed text-mute">{p.blurb}</p>
                <p className="mt-auto pt-5 text-sm text-mute/70">
                  {p.kind}, {p.year}
                  {p.live && <span className="ml-2 text-lime">● Live</span>}
                </p>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
