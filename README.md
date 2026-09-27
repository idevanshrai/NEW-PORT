# idevanshrai.vercel.app

Personal site. Vite + React + TypeScript + Tailwind, with a scroll-driven three.js scene (React Three Fiber).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Hidden stuff

- **⌘K / Ctrl+K**: command menu (jump anywhere, copy email, theme, cube tricks)
- **` (backtick)**: terminal (`help`, `neofetch`, `projects`, `secrets`, `sudo hire devansh`…)
- **↑↑↓↓←→←→BA**: party mode · **click the cube 5×**: it explodes · `cube solve` solves it
- **devansh()** in the browser console · a 404 page at any unknown URL
- 10 secrets in total, tracked per visitor in localStorage (`secrets` in the terminal)
- **P** (or `/play`): play mode — a voxel world of floating islands, one per section, with a hotbar (1–8), panels, advancements, a day/night menu and sounds. Code lives in `src/play/`.

## Adding things

| Add… | How |
| --- | --- |
| A certificate | Drop the PDF/image in `public/certificates/`, add a line to `CERTIFICATES` in `src/data.ts` |
| A blog post | New `.md` file in `src/content/writing/` (copy the header of the draft). `draft: true` = only in dev |
| A project screenshot (hover preview) | Put it in `public/work/`, set `preview: '/work/x.png'` on the project in `src/data.ts` |
| Case-study screenshots | `public/work/<slug>/…`, list them in `shots` in `src/content/caseStudies.ts` |
| Book-a-call button | Set `CAL_LINK` in `src/data.ts` |
| "Now" section | Edit `NOW` in `src/data.ts` |

Lines starting with `TODO` show in lime while you run `npm run dev` and are hidden on the live site.

## Where things live

| What | File |
| --- | --- |
| All copy (intro, experience, projects, lab, now, certificates) | `src/data.ts` |
| Case studies | `src/content/caseStudies.ts` |
| Blog posts | `src/content/writing/*.md` |
| Terminal commands | `src/components/Terminal.tsx` |
| ⌘K commands | `src/lib/commands.ts` |
| Play mode (world, avatar, HUD) | `src/play/` — skill tiers in `SKILLS` in `src/data.ts` |
| Colours (dark + light) | `src/index.css` (`:root` variables) |
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
