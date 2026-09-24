import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { PROFILE } from '../data';

const OPEN = 'dr:open-resume';
const FILE_NAME = 'Devansh-Rai-Resume.pdf';

/**
 * Phones and tablets can't show a PDF inside a page reliably (iOS shows only
 * page 1, Android Chrome shows nothing), so there we just open the PDF in a
 * new tab and let the browser's own viewer handle it.
 */
const canEmbedPdf = () =>
  window.matchMedia('(min-width: 768px) and (pointer: fine)').matches &&
  // Chrome, Edge, Firefox, Safari on desktop all expose this
  (navigator.pdfViewerEnabled ?? true);

/** Use anywhere instead of a plain <a href="/resume.pdf">. */
export const ResumeLink = ({ className, children }: { className?: string; children: ReactNode }) => {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !canEmbedPdf()) return; // let the browser open it
    e.preventDefault();
    window.dispatchEvent(new Event(OPEN));
  };
  return (
    <a href={PROFILE.resume} target="_blank" rel="noopener" onClick={onClick} className={className}>
      {children}
    </a>
  );
};

/** Mount once (in App). Listens for ResumeLink clicks. */
export const ResumeViewer = () => {
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const onOpen = () => {
      opener.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener(OPEN, onOpen);
    return () => window.removeEventListener(OPEN, onOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      (opener.current as HTMLElement | null)?.focus?.();
      return;
    }
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    // stop the page (and Lenis) scrolling underneath
    const html = document.documentElement;
    html.classList.add('lenis-stopped');
    html.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      html.classList.remove('lenis-stopped');
      html.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-ink/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Résumé preview"
          data-lenis-prevent
        >
          <motion.div
            className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-4 md:px-8 md:py-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4 font-mono text-[12px] uppercase tracking-[0.12em]">
              <span className="text-mute">Résumé — Devansh Rai</span>
              <div className="flex items-center gap-6">
                <a
                  href={PROFILE.resume}
                  download={FILE_NAME}
                  className="bg-lime px-3 py-2 text-ink transition-opacity hover:opacity-85"
                >
                  Download PDF ↓
                </a>
                <a href={PROFILE.resume} target="_blank" rel="noopener" className="link-underline hidden text-paper sm:inline">
                  New tab ↗
                </a>
                <button ref={closeBtn} onClick={() => setOpen(false)} className="text-paper link-underline">
                  Close ✕
                </button>
              </div>
            </div>
            <iframe
              title="Résumé"
              src={`${PROFILE.resume}#view=FitH&toolbar=0&navpanes=0`}
              className="mt-4 w-full flex-1 bg-white"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
