import { motion } from 'framer-motion';
import { caseStudy } from '../content/caseStudies';
import { WORK } from '../data';
import { Reveal } from '../components/Reveal';
import { Back, PageShell } from './PageShell';
import { NotFound } from './NotFound';

const show = (s: string) => import.meta.env.DEV || !s.startsWith('TODO');

const H = ({ n, children }: { n: string; children: string }) => (
  <div className="grid gap-4 md:grid-cols-12">
    <p className="label md:col-span-3">
      <span className="text-lime">{n}</span> — {children}
    </p>
  </div>
);

export const CaseStudyPage = ({ slug }: { slug: string }) => {
  const cs = caseStudy(slug);
  const idx = WORK.findIndex((w) => w.slug === slug);
  const p = WORK[idx];
  if (!cs || !p) return <NotFound />;
  const next = WORK[(idx + 1) % WORK.length];
  const learned = cs.learned.filter(show);

  return (
    <PageShell title={p.name}>
      <article className="mx-auto max-w-page">
        <Back href="/#work">All work</Back>

        <header className="mt-10 border-b border-line pb-12">
          <p className="label">
            Case study · {p.kind} · {p.year}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="display mt-5 text-[18vw] text-paper md:text-[11vw]"
          >
            {p.name}
          </motion.h1>
          <p className="mt-6 max-w-2xl font-serif text-3xl leading-tight text-paper md:text-4xl">{cs.tagline}</p>

          <dl className="mt-12 grid grid-cols-2 gap-y-6 md:grid-cols-4">
            {[
              ['Role', cs.role],
              ['When', cs.timeline],
              ['Stack', p.stack.join(', ')],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd className="mt-2 text-paper">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="label">Links</dt>
              <dd className="mt-2 flex gap-4">
                <a href={p.repo} target="_blank" rel="noopener" className="link-underline text-paper">
                  Code ↗
                </a>
                {p.live && (
                  <a href={p.live} target="_blank" rel="noopener" className="link-underline text-paper">
                    Live ↗
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </header>

        <section className="mt-20 space-y-8">
          <H n="01">The problem</H>
          <div className="md:ml-[25%]">
            <div className="prose-dr">
              {cs.problem.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 space-y-8">
          <H n="02">What I built</H>
          <ul className="grid gap-px bg-line md:ml-[25%] md:grid-cols-2">
            {cs.built.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.04} className="bg-ink">
                <li className="h-full p-6">
                  <p className="font-mono text-sm text-lime">{b.title}</p>
                  <p className="mt-2 text-paper/85">{b.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="mt-24 space-y-8">
          <H n="03">How it works</H>
          <div className="space-y-12 md:ml-[25%]">
            {cs.how.map((h) => (
              <div key={h.title} className="prose-dr">
                <h3>{h.title}</h3>
                <p>{h.body}</p>
                {h.code && (
                  <pre>
                    <code>{h.code}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>

        {cs.shots.length > 0 && (
          <section className="mt-24 space-y-8">
            <H n="04">Screens</H>
            <div className="grid gap-6 md:ml-[25%]">
              {cs.shots.map((s) => (
                <figure key={s.src}>
                  <img src={s.src} alt={s.caption} loading="lazy" className="w-full border border-line" />
                  <figcaption className="label mt-3">{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {learned.length > 0 && (
          <section className="mt-24 space-y-8">
            <H n="05">What I learned</H>
            <div className="prose-dr md:ml-[25%]">
              {learned.map((l) => (
                <p key={l} className={l.startsWith('TODO') ? 'text-lime' : undefined}>
                  {l}
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="mt-24 space-y-8">
          <H n="06">What’s next</H>
          <ul className="flex flex-wrap gap-3 md:ml-[25%]">
            {cs.next.map((n) => (
              <li key={n} className="border border-line px-4 py-2 font-mono text-[12px] text-mute">
                {n}
              </li>
            ))}
          </ul>
        </section>

        {next && next.slug !== slug && (
          <a href={`/work/${next.slug}`} className="group mt-32 block border-t border-line pt-10">
            <p className="label">Next case study</p>
            <p className="display mt-4 text-6xl text-paper transition-colors group-hover:text-lime md:text-8xl">
              {next.name} →
            </p>
          </a>
        )}
      </article>
    </PageShell>
  );
};
