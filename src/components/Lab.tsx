import { LAB } from '../data';
import { Reveal, SectionLabel } from './Reveal';

export const Lab = () => (
  <section id="lab" className="relative px-5 py-28 md:px-10 md:py-40">
    <div className="mx-auto max-w-page md:pr-[22vw]">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel n="04">Lab</SectionLabel>
        </div>
        <h2 className="display text-6xl text-paper md:col-span-9 md:text-[8vw]">
          Smaller
          <span className="font-serif font-normal italic tracking-normal"> builds</span>
        </h2>
      </div>

      <Reveal className="mt-16 md:mt-24">
        <ul className="border-b border-line">
          {LAB.map((p) => (
            <li key={p.name} className="group border-t border-line">
              <a
                href={p.live ?? p.repo}
                target="_blank"
                rel="noopener"
                className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 transition-colors md:grid-cols-12 md:gap-10"
              >
                <span className="text-lg text-paper transition-colors group-hover:text-lime md:col-span-3 md:text-xl">
                  {p.name}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute md:order-last md:col-span-1 md:text-right">
                  {p.year}
                </span>
                <span className="col-span-2 text-sm text-mute md:col-span-6 md:text-base">{p.blurb}</span>
                <span className="col-span-2 font-mono text-[11px] uppercase tracking-[0.12em] text-mute/80 md:col-span-2">
                  {p.kind}
                  {p.live && <span className="ml-2 text-lime">● live</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
);
