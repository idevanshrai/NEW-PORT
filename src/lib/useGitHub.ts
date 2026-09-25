import { useEffect, useState } from 'react';

export type GitHubData = {
  contributions: number | null;
  repos: number;
  stars: number;
  days: { date: string; count: number }[] | null;
  latest: { name: string; url: string; pushedAt: string } | null;
};

let cache: Promise<GitHubData | null> | null = null;

/** One shared request to /api/github (a Vercel function) for the whole page. */
export function useGitHub() {
  const [data, setData] = useState<GitHubData | null>(null);
  useEffect(() => {
    cache ??= fetch('/api/github')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && typeof d.repos === 'number' ? (d as GitHubData) : null))
      .catch(() => null);
    let live = true;
    cache.then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, []);
  return data;
}

export function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [number, string][] = [
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24 * 7, 'week'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  for (const [n, u] of units) if (s >= n) {
    const v = Math.floor(s / n);
    return `${v} ${u}${v > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
