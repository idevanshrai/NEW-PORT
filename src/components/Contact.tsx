import { CAL_LINK, PROFILE } from '../data';
import { track } from '../lib/bus';
import { copyEmail } from '../lib/commands';
import { Magnetic } from './Magnetic';
import { SectionLabel } from './Reveal';
import { ResumeLink } from './ResumeViewer';

export const Contact = () => (
  <footer id="contact" className="relative flex min-h-[100svh] flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pt-40">
    <div className="mx-auto w-full max-w-page">
      <SectionLabel n="08">Contact</SectionLabel>
      <h2 className="display mt-10 text-[18vw] text-paper md:text-[13vw]">
        Say
        <span className="font-serif font-normal italic tracking-normal text-lime"> hello</span>
      </h2>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={`mailto:${PROFILE.email}`}
          onClick={() => track('email_click')}
          className="inline-block break-all text-2xl text-paper link-underline md:text-5xl"
        >
          {PROFILE.email}
        </a>
        <button
          onClick={copyEmail}
          className="border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-mute transition-colors hover:border-paper hover:text-paper"
        >
          Copy
        </button>
      </div>
      <p className="mt-6 max-w-md text-mute">
        Internships, full-time roles, or a project you think I’d enjoy. Email is the fastest way to reach me.
      </p>
      {CAL_LINK && (
        <Magnetic className="mt-10 inline-block">
          <a
            href={CAL_LINK}
            target="_blank"
            rel="noopener"
            onClick={() => track('book_call')}
            className="inline-block bg-lime px-6 py-4 font-mono text-[12px] uppercase tracking-[0.12em] text-onlime"
          >
            Book a 20-min call ↗
          </a>
        </Magnetic>
      )}
    </div>

    <div className="mx-auto mt-24 grid w-full max-w-page grid-cols-2 gap-6 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-mute md:grid-cols-5">
      <a href={PROFILE.github} target="_blank" rel="noopener" className="link-underline w-fit">
        GitHub ↗
      </a>
      <a href={PROFILE.linkedin} target="_blank" rel="noopener" className="link-underline w-fit">
        LinkedIn ↗
      </a>
      <ResumeLink className="link-underline w-fit">Résumé ↗</ResumeLink>
      <span className="hidden md:inline">⌘K · ` · ↑↑↓↓←→←→BA</span>
      <span className="md:text-right">© {new Date().getFullYear()} Devansh Rai</span>
    </div>
  </footer>
);
