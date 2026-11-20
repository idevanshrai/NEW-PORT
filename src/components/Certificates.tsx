import { CERTIFICATES } from '../data';
import { Reveal } from './Reveal';
import { DocLink } from './ResumeViewer';

export const Certificates = () => (
  <section id="certificates" className="relative px-5 py-28 md:px-10 md:py-40">
    <div className="mx-auto max-w-page lg:pr-[22vw]">
      <div className="grid gap-10 md:grid-cols-12">
        <h2 className="display text-6xl text-paper md:col-span-12 md:text-[8vw]">
          On
          <span className="font-serif font-normal italic tracking-normal"> paper</span>
        </h2>
      </div>

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 md:mt-24">
        {CERTIFICATES.map((c, i) => (
          <Reveal key={c.file} delay={i * 0.06}>
            <li>
              <DocLink
                doc={{ url: c.file, title: `${c.title} — ${c.issuer}`, filename: c.file.split('/').pop()! }}
                className="group block border border-line bg-char/40 p-3 transition-colors duration-300 hover:border-lime"
              >
                {c.thumb && (
                  <div className="overflow-hidden bg-white">
                    <img
                      src={c.thumb}
                      alt=""
                      loading="lazy"
                      className="aspect-[1.414] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex items-end justify-between gap-4 px-1 pb-1 pt-4">
                  <div>
                    <p className="text-paper">{c.title}</p>
                    <p className="mt-1 text-sm text-mute">
                      {c.issuer} · {c.date}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute transition-colors group-hover:text-lime">
                    View ↗
                  </span>
                </div>
              </DocLink>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  </section>
);
