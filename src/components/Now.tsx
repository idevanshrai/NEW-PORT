import { NOW } from '../data';
import { ago, useGitHub } from '../lib/useGitHub';
import { Reveal, SectionLabel } from './Reveal';

/** What I'm up to this month — plus a live "last pushed" line from GitHub. */
export const Now = () => {
  const gh = useGitHub();
  const items = NOW.items.filter((i) => import.meta.env.DEV || !i.v.startsWith('TODO'));

  return (
    <section id="now" className="relative px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-page gap-10 md:grid-cols-12 md:pr-[22vw]">
        <div className="md:col-span-3">
          <SectionLabel n="06">Now</SectionLabel>
          <p className="label mt-4">Updated {NOW.updated}</p>
        </div>
        <div className="md:col-span-9">
          <h2 className="display text-6xl text-paper md:text-[8vw]">
            Right
            <span className="font-serif font-normal italic tracking-normal"> now</span>
          </h2>
          <dl className="mt-14 border-b border-line">
            {items.map((i, n) => (
              <Reveal key={i.k} delay={n * 0.05}>
                <div className="grid gap-2 border-t border-line py-6 md:grid-cols-[10rem_1fr] md:gap-8">
                  <dt className="label pt-1.5">{i.k}</dt>
                  <dd className={`text-xl leading-snug md:text-2xl ${i.v.startsWith('TODO') ? 'text-lime' : 'text-paper'}`}>{i.v}</dd>
                </div>
              </Reveal>
            ))}
            {gh?.latest && (
              <div className="grid gap-2 border-t border-line py-6 md:grid-cols-[10rem_1fr] md:gap-8">
                <dt className="label flex items-center gap-2 pt-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> Last push
                </dt>
                <dd className="text-xl leading-snug text-paper md:text-2xl">
                  <a href={gh.latest.url} target="_blank" rel="noopener" className="link-underline">
                    {gh.latest.name}
                  </a>{' '}
                  <span className="text-mute">— {ago(gh.latest.pushedAt)}</span>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
};
