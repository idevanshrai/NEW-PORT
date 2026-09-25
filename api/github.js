// Vercel serverless function: GET /api/github
// The GitHub token lives ONLY on the server (Vercel → Settings → Environment
// Variables → GITHUB_TOKEN). It is never shipped to the browser.
// Without a token it still works, using GitHub's public REST API (no contribution calendar).

const USER = 'idevanshrai';

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
        totalCount
        nodes { stargazerCount }
      }
      latest: repositories(first: 1, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: { field: PUSHED_AT, direction: DESC }) {
        nodes { name url pushedAt }
      }
    }
  }
`;

async function withToken(token) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${USER}-portfolio`,
    },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  if (!r.ok) throw new Error(`GraphQL ${r.status}`);
  const json = await r.json();
  const user = json?.data?.user;
  if (!user) throw new Error('GraphQL: no user');

  const cal = user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays).map((d) => ({
    date: d.date,
    count: d.contributionCount,
  }));

  return {
    contributions: cal.totalContributions,
    repos: user.repositories.totalCount,
    stars: user.repositories.nodes.reduce((a, n) => a + n.stargazerCount, 0),
    days: days.slice(-26 * 7),
    latest: user.latest.nodes[0]
      ? { name: user.latest.nodes[0].name, url: user.latest.nodes[0].url, pushedAt: user.latest.nodes[0].pushedAt }
      : null,
  };
}

async function withoutToken() {
  const headers = { 'User-Agent': `${USER}-portfolio`, Accept: 'application/vnd.github+json' };
  const r = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner&sort=pushed`, { headers });
  if (!r.ok) throw new Error(`REST ${r.status}`);
  const repos = (await r.json()).filter((x) => !x.fork);
  return {
    contributions: null,
    repos: repos.length,
    stars: repos.reduce((a, x) => a + x.stargazers_count, 0),
    days: null,
    latest: repos[0] ? { name: repos[0].name, url: repos[0].html_url, pushedAt: repos[0].pushed_at } : null,
  };
}

export default async function handler(_req, res) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const data = token ? await withToken(token).catch(() => withoutToken()) : await withoutToken();
    // Cache on Vercel's edge for 1h, serve stale while refreshing.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(502).json({ error: String(err?.message || err) });
  }
}
