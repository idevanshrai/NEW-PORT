import { fmtDate, POSTS } from '../content/writing';

/** Latest posts on the home page. Renders nothing until something is published. */
export const WritingPreview = () => {
  if (!POSTS.length) return null;
  return (
    <section id="writing" className="relative px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-page lg:pr-[22vw]">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="flex items-end justify-between gap-6 md:col-span-12">
            <h2 className="display text-6xl text-paper md:text-[8vw]">
              Notes
            </h2>
            <a href="/writing" className="label link-underline mb-2 text-paper">
              All posts →
            </a>
          </div>
        </div>
        <ul className="mt-16 border-b border-line">
          {POSTS.slice(0, 3).map((p) => (
            <li key={p.slug} className="group border-t border-line">
              <a href={`/writing/${p.slug}`} className="grid gap-2 py-6 md:grid-cols-12 md:gap-10">
                <span className="label pt-1 md:col-span-3">
                  {fmtDate(p.date)}
                  {p.draft && <span className="ml-2 text-lime">draft</span>}
                </span>
                <span className="md:col-span-9">
                  <span className="block text-2xl text-paper transition-colors group-hover:text-lime">{p.title}</span>
                  <span className="mt-1 block text-mute">{p.summary}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
