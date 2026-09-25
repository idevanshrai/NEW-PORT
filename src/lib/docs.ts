import { PROFILE } from '../data';
import { emit, track } from './bus';

export type Doc = { url: string; title: string; filename: string };

export const RESUME: Doc = { url: PROFILE.resume, title: 'Résumé — Devansh Rai', filename: 'Devansh-Rai-Resume.pdf' };

/**
 * Phones and tablets can't show a PDF inside a page reliably (iOS shows only
 * page 1, Android Chrome shows nothing), so there we just open the file in a
 * new tab and let the browser's own viewer handle it.
 */
export const canEmbedPdf = () =>
  window.matchMedia('(min-width: 768px) and (pointer: fine)').matches && (navigator.pdfViewerEnabled ?? true);

export const isPdf = (url: string) => url.toLowerCase().endsWith('.pdf');

export const openResume = () => {
  track('doc_open', { title: RESUME.title });
  if (canEmbedPdf()) emit('dr:open-doc', RESUME);
  else window.open(RESUME.url, '_blank', 'noopener');
};
