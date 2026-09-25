import { useEffect } from 'react';
import { emit, findSecret } from '../lib/bus';
import { PageShell } from './PageShell';

/** 404 — the cube (rendered by App in "broken" mode) floats in pieces behind this. */
export const NotFound = () => {
  useEffect(() => findSecret('lost'), []);
  return (
    <PageShell title="Page not found">
      <div className="mx-auto flex min-h-[70svh] max-w-page flex-col items-center justify-end text-center">
        <p className="label">Error 404</p>
        <h1 className="display mt-4 text-[34vw] leading-none text-paper md:text-[16vw]">
          4<span className="font-serif font-normal italic text-lime">0</span>4
        </h1>
        <p className="mt-6 max-w-md text-lg text-paper/80">
          This page got scrambled. Nothing lives at <span className="font-mono text-lime">{window.location.pathname}</span>.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em]">
          <a href="/" className="bg-lime px-5 py-3 text-onlime">
            Take me home
          </a>
          <button onClick={() => emit('dr:cube', 'solve')} className="border border-line px-5 py-3 text-paper hover:border-paper">
            Try fixing the cube
          </button>
          <button onClick={() => emit('dr:terminal', 'open')} className="border border-line px-5 py-3 text-paper hover:border-paper">
            Open terminal
          </button>
        </div>
      </div>
    </PageShell>
  );
};
