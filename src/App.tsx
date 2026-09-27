import { Suspense, lazy, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Splash } from './components/Splash';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { Work } from './components/Work';
import { Lab } from './components/Lab';
import { Certificates } from './components/Certificates';
import { Now } from './components/Now';
import { GitHubActivity } from './components/GitHubActivity';
import { WritingPreview } from './components/WritingPreview';
import { Contact } from './components/Contact';
import { SmoothScroll } from './components/SmoothScroll';
import { ResumeViewer } from './components/ResumeViewer';
import { CommandPalette } from './components/CommandPalette';
import { Terminal } from './components/Terminal';
import { Toasts } from './components/Toasts';
import { EasterEggs } from './components/EasterEggs';
import { NotFound } from './pages/NotFound';
import { POSTS } from './content/writing';
import { installLinkInterceptor, usePath } from './lib/router';

// three.js is ~600 KB — load it in its own chunk, after the page is already on screen.
const Scene3D = lazy(() => import('./components/Scene3D'));
// Inner pages load on demand too
const CaseStudyPage = lazy(() => import('./pages/CaseStudyPage').then((m) => ({ default: m.CaseStudyPage })));
const WritingIndex = lazy(() => import('./pages/WritingPages').then((m) => ({ default: m.WritingIndex })));
const PostPage = lazy(() => import('./pages/WritingPages').then((m) => ({ default: m.PostPage })));
// Play mode: a whole separate game-style experience, loaded only when visited
const PlayPage = lazy(() => import('./play/PlayPage'));

function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function useIdleMount() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!canUseWebGL()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setReady(true));
    else setTimeout(() => setReady(true), 300);
  }, []);
  return ready;
}

const Home = () => (
  <>
    <Hero />
    <Marquee />
    <About />
    <Experience />
    <Work />
    <Lab />
    <Certificates />
    <Now />
    <GitHubActivity />
    <WritingPreview />
  </>
);

/** Which page to show for the current URL. */
function route(path: string): { page: React.ReactNode; scene: 'home' | 'broken' | null } {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/') return { page: <Home />, scene: 'home' };
  let m = p.match(/^\/work\/([\w-]+)$/);
  if (m) return { page: <CaseStudyPage key={m[1]} slug={m[1]} />, scene: null };
  if (p === '/writing' && POSTS.length) return { page: <WritingIndex />, scene: null };
  m = p.match(/^\/writing\/([\w-]+)$/);
  if (m) return { page: <PostPage key={m[1]} slug={m[1]} />, scene: null };
  return { page: <NotFound />, scene: 'broken' };
}

export default function App() {
  const ready = useIdleMount();
  const path = usePath();
  const { page, scene } = route(path);

  useEffect(() => installLinkInterceptor(), []);

  if (path.replace(/\/+$/, '') === '/play')
    return (
      <>
        <Analytics />
        <ResumeViewer />
        <EasterEggs />
        <Suspense fallback={<div className="fixed inset-0 bg-[#15130f]" />}>
          <PlayPage />
        </Suspense>
      </>
    );

  return (
    <>
      <Analytics />
      <SmoothScroll />
      <Splash />
      <ResumeViewer />
      <CommandPalette />
      <Terminal />
      <Toasts />
      <EasterEggs />
      <div className="grain" aria-hidden />

      {ready && scene && (
        <Suspense fallback={null}>
          {/* key: remount when switching between home and 404 so it starts fresh */}
          <Scene3D key={scene} mode={scene} />
        </Suspense>
      )}

      <Nav />
      <main className="relative z-10">
        <Suspense fallback={<div className="min-h-[100svh]" />}>{page}</Suspense>
      </main>
      <div className="relative z-10">
        <Contact />
      </div>
    </>
  );
}
