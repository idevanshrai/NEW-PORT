import { useEffect, useState } from 'react';
import { fmtDate, post, POSTS } from '../content/writing';
import { Back, PageShell } from './PageShell';
import { NotFound } from './NotFound';

export const WritingIndex = () => (
  <PageShell title="Writing">
    <div className="mx-auto max-w-page">
      <Back href="/">Home</Back>
      <h1 className="display mt-10 text-[20vw] text-paper md:text-[11vw]">
        Notes<span className="font-serif font-normal italic text-lime">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-mute">Things I learned building stuff, written down so I don’t forget them.</p>
      <ul className="mt-16 border-b border-line">
        {POSTS.map((p) => (
          <li key={p.slug} className="group border-t border-line">
            <a href={`/writing/${p.slug}`} className="grid gap-2 py-8 md:grid-cols-12 md:gap-10">
              <span className="label pt-1 md:col-span-3">
                {fmtDate(p.date)} · {p.minutes} min
                {p.draft && <span className="ml-2 text-lime">draft</span>}
              </span>
              <span className="md:col-span-9">
                <span className="block text-3xl text-paper transition-colors group-hover:text-lime">{p.title}</span>
                <span className="mt-2 block text-mute">{p.summary}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </PageShell>
);

export const PostPage = ({ slug }: { slug: string }) => {
  const p = post(slug);
  const [html, setHtml] = useState('');
  useEffect(() => {
    if (!p) return;
    let live = true;
    import('marked').then(({ Marked }) => {
      // Safe by construction: raw HTML in a post is shown as text, and links/images
      // only keep http(s), mailto, relative and #anchor URLs (no javascript: etc.).
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // allowlist (not a scheme blocklist): browsers ignore tabs/newlines and decode entities in
      // URLs, so "java\tscript:" or "&#106;avascript:" must not slip through as "relative"
      const safeUrl = (u: string) => /^(https?:\/\/|mailto:|#|\/|\.{1,2}\/)\S*$/i.test(u) || /^[\w\-./]+$/.test(u);
      const md = new Marked({
        async: false,
        renderer: { html: ({ text }) => esc(text) },
        walkTokens: (t) => {
          if ((t.type === 'link' || t.type === 'image') && !safeUrl(t.href)) t.href = '#';
        },
      });
      if (live) setHtml(md.parse(p.body) as string);
    });
    return () => {
      live = false;
    };
  }, [p]);
  if (!p) return <NotFound />;
  return (
    <PageShell title={p.title}>
      <article className="mx-auto max-w-page">
        <Back href="/writing">All notes</Back>
        <header className="mt-10 max-w-3xl">
          <p className="label">
            {fmtDate(p.date)} · {p.minutes} min read
            {p.draft && <span className="ml-2 text-lime">draft — only visible in dev</span>}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-paper md:text-7xl">{p.title}</h1>
          {p.summary && <p className="mt-6 text-xl text-mute">{p.summary}</p>}
        </header>
        {/* posts are your own Markdown files, parsed in the browser with raw HTML escaped and unsafe links dropped */}
        <div className="prose-dr mt-14" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </PageShell>
  );
};
