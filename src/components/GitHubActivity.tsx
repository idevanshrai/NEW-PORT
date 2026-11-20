import { useGitHub } from '../lib/useGitHub';
import { PROFILE } from '../data';
import { Reveal } from './Reveal';

// Talks to /api/github (a Vercel function). No token ever reaches the browser.
// If the API is unavailable (e.g. plain `npm run dev`), only the profile link shows —
// never fake numbers.
export const GitHubActivity = () => {
  const data = useGitHub();

  const max = data?.days ? Math.max(1, ...data.days.map((d) => d.count)) : 1;
  const level = (c: number) => (c === 0 ? 0 : Math.ceil((c / max) * 4));
  const shades = ['bg-line/60', 'bg-lime/25', 'bg-lime/50', 'bg-lime/75', 'bg-lime'];

  return (
    <section id="github" className="relative px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-page lg:pr-[22vw] gap-10 md:grid-cols-12">
        <div className="md:col-span-12">
          <h2 className="display mb-14 text-6xl text-paper md:text-[8vw]">
            On
            <span className="font-serif font-normal italic tracking-normal"> GitHub</span>
          </h2>
          {data && (
            <Reveal>
              <dl className="grid grid-cols-3 border-t border-line">
                {[
                  { k: 'Contributions, last year', v: data.contributions },
                  { k: 'Public repos', v: data.repos },
                  { k: 'Stars', v: data.stars },
                ]
                  .filter((s) => s.v !== null)
                  .map((s) => (
                    <div key={s.k} className="border-b border-line py-6 pr-4">
                      <dd className="display text-5xl text-paper md:text-7xl">{s.v}</dd>
                      <dt className="label mt-3">{s.k}</dt>
                    </div>
                  ))}
              </dl>

              {data.days && (
                <div className="mt-10 overflow-x-auto pb-2">
                  <div
                    className="grid w-max grid-flow-col grid-rows-7 gap-[3px]"
                    role="img"
                    aria-label="Contribution graph for the last six months"
                  >
                    {data.days.map((d) => (
                      <span
                        key={d.date}
                        title={`${d.count} on ${d.date}`}
                        className={`h-3 w-3 rounded-[2px] md:h-3.5 md:w-3.5 ${shades[level(d.count)]}`}
                      />
                    ))}
                  </div>
                  <p className="label mt-3">Last 26 weeks</p>
                </div>
              )}
            </Reveal>
          )}

          {!data && (
            <p className="font-serif text-4xl leading-tight text-paper md:text-5xl">
              Fifty-odd public repos, from Arduino robots to SwiftUI apps.
            </p>
          )}
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener"
            className="mt-10 inline-block font-mono text-[12px] uppercase tracking-[0.12em] text-paper link-underline"
          >
            github.com/idevanshrai ↗
          </a>
        </div>
      </div>
    </section>
  );
};
