import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { canEmbedPdf, isPdf, RESUME, type Doc } from '../lib/docs';
import { emit, on, track } from '../lib/bus';
import { lockScroll } from '../lib/lenis';

/** Opens a PDF or image in the in-page viewer. */
export const DocLink = ({ doc, className, children }: { doc: Doc; className?: string; children: ReactNode }) => {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    track('doc_open', { title: doc.title });
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (isPdf(doc.url) && !canEmbedPdf()) return; // let the browser open it
    e.preventDefault();
    emit('dr:open-doc', doc);
  };
  return (
    <a href={doc.url} target="_blank" rel="noopener" onClick={onClick} className={className}>
      {children}
    </a>
  );
};

export const ResumeLink = ({ className, children }: { className?: string; children: ReactNode }) => (
  <DocLink doc={RESUME} className={className}>
    {children}
  </DocLink>
);

/** Mount once (in App). Shows whatever DocLink asked for. */
export const ResumeViewer = () => {
  const [doc, setDoc] = useState<Doc | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(
    () =>
      on('dr:open-doc', (d) => {
        opener.current = document.activeElement;
        setDoc(d);
      }),
    [],
  );

  useEffect(() => {
    if (!doc) {
      (opener.current as HTMLElement | null)?.focus?.();
      return;
    }
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDoc(null);
    window.addEventListener('keydown', onKey);
    lockScroll(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [doc]);

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-ink/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setDoc(null)}
          role="dialog"
          aria-modal="true"
          aria-label={doc.title}
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
              <span className="truncate text-mute">{doc.title}</span>
              <div className="flex shrink-0 items-center gap-6">
                <a
                  href={doc.url}
                  download={doc.filename}
                  className="bg-lime px-3 py-2 text-onlime transition-opacity hover:opacity-85"
                >
                  Download ↓
                </a>
                <a href={doc.url} target="_blank" rel="noopener" className="link-underline hidden text-paper sm:inline">
                  New tab ↗
                </a>
                <button ref={closeBtn} onClick={() => setDoc(null)} className="text-paper link-underline">
                  Close ✕
                </button>
              </div>
            </div>
            {isPdf(doc.url) ? (
              <iframe
                title={doc.title}
                src={`${doc.url}#view=FitH&toolbar=0&navpanes=0`}
                className="mt-4 w-full flex-1 bg-white"
              />
            ) : (
              <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
                <img src={doc.url} alt={doc.title} className="max-h-full max-w-full object-contain shadow-2xl" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
