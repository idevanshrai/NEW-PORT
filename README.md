# idevanshrai.vercel.app

Personal site. Vite + React + TypeScript + Tailwind, with a scroll-driven three.js scene (React Three Fiber).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Where things live

| What | File |
| --- | --- |
| All copy (intro, experience, projects, lab) | `src/data.ts` |
| The 3D scroll scene | `src/components/Scene3D.tsx` |
| GitHub stats (server-side) | `api/github.js` |
| Link-preview image | `public/og.jpg` |

## The 3D scene

27 blocks, one formation per section (`top`, `about`, `experience`, `work`, `lab`, `github`, `contact`).
Between two section centres the blocks interpolate from one formation to the next. It loads in its own
chunk after the page is on screen, is skipped when WebGL is unavailable, freezes for
`prefers-reduced-motion`, and fades almost out on phones between the hero and the footer.

## GitHub stats

`/api/github` is a Vercel serverless function. Put a GitHub token in **Vercel → Settings → Environment
Variables** as `GITHUB_TOKEN` (no `VITE_` prefix — anything prefixed `VITE_` ends up in the public
bundle). Without a token it falls back to public repo/star counts. `npm run dev` doesn't run `/api`, so
the section shows its text fallback locally; use `npx vercel dev` to test it.
