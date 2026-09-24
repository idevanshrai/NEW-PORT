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
import { GitHubActivity } from './components/GitHubActivity';
import { Contact } from './components/Contact';
import { SmoothScroll } from './components/SmoothScroll';
import { ResumeViewer } from './components/ResumeViewer';

// three.js is ~600 KB — load it in its own chunk, after the page is already on screen.
const Scene3D = lazy(() => import('./components/Scene3D'));

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

export default function App() {
  const scene = useIdleMount();

  return (
    <>
      <Analytics />
      <SmoothScroll />
      <Splash />
      <ResumeViewer />
      <div className="grain" aria-hidden />

      {scene && (
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      )}

      <Nav />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <About />
        <Experience />
        <Work />
        <Lab />
        <GitHubActivity />
      </main>
      <div className="relative z-10">
        <Contact />
      </div>
    </>
  );
}
