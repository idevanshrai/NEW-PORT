/**
 * Blog posts live in src/content/writing/*.md with a small header:
 *
 *   ---
 *   title: My post
 *   date: 2026-10-01
 *   summary: One line for the list
 *   draft: false
 *   ---
 *
 * Drafts only appear while you run `npm run dev`.
 */
export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  draft: boolean;
  /** raw Markdown — PostPage turns it into HTML (the Markdown library loads only there) */
  body: string;
  minutes: number;
}

const files = import.meta.glob('./writing/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

function parse(path: string, raw: string): Post {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  (m?.[1] ?? '').split('\n').forEach((line) => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  const body = m?.[2] ?? raw;
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? '',
    summary: meta.summary ?? '',
    draft: meta.draft === 'true',
    body,
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
  };
}

export const POSTS: Post[] = Object.entries(files)
  .map(([p, raw]) => parse(p, raw))
  .filter((p) => import.meta.env.DEV || !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export const post = (slug: string) => POSTS.find((p) => p.slug === slug);

export const fmtDate = (d: string) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
