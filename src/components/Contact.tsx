import { PROFILE } from '../data';
import { SectionLabel } from './Reveal';
import { ResumeLink } from './ResumeViewer';

export const Contact = () => (
  <footer id="contact" className="relative flex min-h-[100svh] flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pt-40">
    <div className="mx-auto w-full max-w-page">
      <SectionLabel n="06">Contact</SectionLabel>
      <h2 className="display mt-10 text-[18vw] text-paper md:text-[13vw]">
        Say
        <span className="font-serif font-normal italic tracking-normal text-lime"> hello</span>
      </h2>
      <a
        href={`mailto:${PROFILE.email}`}
        className="mt-6 inline-block break-all text-2xl text-paper link-underline md:text-5xl"
      >
        {PROFILE.email}
      </a>
      <p className="mt-6 max-w-md text-mute">
        Internships, full-time roles, or a project you think I’d enjoy. Email is the fastest way to reach me.
      </p>
    </div>

    <div className="mx-auto mt-24 grid w-full max-w-page grid-cols-2 gap-6 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-mute md:grid-cols-4">
      <a href={PROFILE.github} target="_blank" rel="noopener" className="link-underline w-fit">
        GitHub ↗
      </a>
      <a href={PROFILE.linkedin} target="_blank" rel="noopener" className="link-underline w-fit">
        LinkedIn ↗
      </a>
      <ResumeLink className="link-underline w-fit">Résumé ↗</ResumeLink>
      <span className="md:text-right">© {new Date().getFullYear()} Devansh Rai</span>
    </div>
  </footer>
);
