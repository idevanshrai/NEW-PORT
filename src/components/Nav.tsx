import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PROFILE } from '../data';
import { ResumeLink } from './ResumeViewer';
import { lockScroll } from '../lib/lenis';
import { emit, on } from '../lib/bus';
import { getTheme, toggleTheme, type Theme } from '../lib/theme';
import { POSTS } from '../content/writing';

const LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#work', label: 'Work' },
  { href: '/#lab', label: 'Lab' },
  ...(POSTS.length ? [{ href: '/writing', label: 'Writing' }] : []),
  { href: '/#contact', label: 'Contact' },
];

/** Sun / moon switch. */
const ThemeButton = ({ className = '' }: { className?: string }) => {
  const [theme, setT] = useState<Theme>(() => getTheme());
  useEffect(() => on('dr:theme', setT), []);
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title="Toggle theme"
      className={`relative grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-line transition-colors hover:border-paper ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.3 }}
          className="text-[13px] leading-none"
        >
          {theme === 'light' ? '☾' : '☀'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

const ease = [0.7, 0, 0.2, 1] as const;

/** Phones: slide-in side menu. */
const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    lockScroll(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-y-0 right-0 z-[80] flex w-[86vw] max-w-sm flex-col border-l border-line bg-char px-6 pb-8 pt-5 md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.55, ease }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.12em]">
              <span className="text-mute">Menu</span>
              <button onClick={onClose} className="text-paper" aria-label="Close menu">
                Close ✕
              </button>
            </div>

            <nav className="mt-12 flex-1">
              <ul>
                {LINKS.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                    className="border-b border-line"
                  >
                    <a
                      ref={i === 0 ? first : undefined}
                      href={l.href}
                      onClick={onClose}
                      className="group flex items-baseline justify-between py-4"
                    >
                      <span className="display text-5xl text-paper transition-colors group-hover:text-lime">
                        {l.label}
                      </span>
                      <span className="font-mono text-xs text-mute">0{i + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-6 font-mono text-[12px] uppercase tracking-[0.12em]"
            >
              <ResumeLink className="block bg-lime px-5 py-4 text-center text-onlime">View résumé</ResumeLink>
              <div className="flex items-center justify-between text-mute">
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => emit('dr:terminal', 'open'), 300);
                  }}
                  className="text-paper"
                >
                  ❯ Open terminal
                </button>
                <span className="flex items-center gap-2">
                  Theme <ThemeButton />
                </span>
              </div>
              <div className="flex justify-between text-paper">
                <a href={PROFILE.github} target="_blank" rel="noopener">GitHub ↗</a>
                <a href={PROFILE.linkedin} target="_blank" rel="noopener">LinkedIn ↗</a>
                <a href={`mailto:${PROFILE.email}`}>Email</a>
              </div>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Transparent over the hero; once you scroll it gets a solid bar so it never
 * sits on top of section text. Slides away while scrolling down, comes back on scroll up.
 */
export const Nav = () => {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400);
        last = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = useCallback(() => setMenu(false), []);

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 px-5 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:px-10',
          solid ? 'border-b border-line bg-ink/90 backdrop-blur-md' : 'border-b border-transparent',
          hidden && !menu ? '-translate-y-full' : 'translate-y-0',
        ].join(' ')}
      >
        <nav className="relative mx-auto flex max-w-page items-center justify-between py-4 font-mono text-[12px] uppercase tracking-[0.12em] text-paper">
          <a href="#top" className="font-semibold">
            DR<span className="text-lime">.</span>
          </a>
          <ul className="absolute left-1/2 hidden -translate-x-1/2 gap-8 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link-underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-5">
            <button
              onClick={() => emit('dr:palette', 'open')}
              className="hidden items-center gap-1.5 border border-line px-2 py-1 text-mute transition-colors hover:border-paper hover:text-paper lg:flex"
              aria-label="Open command menu"
            >
              <kbd className="font-mono">⌘K</kbd>
            </button>
            <ThemeButton className="hidden md:grid" />
            <ResumeLink className="link-underline hidden md:inline">Résumé ↗</ResumeLink>
            <button
              className="flex items-center gap-3 md:hidden"
              onClick={() => setMenu(true)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
            >
              Menu
              <span className="flex w-5 flex-col gap-[5px]">
                <span className="h-px w-full bg-paper" />
                <span className="h-px w-3/5 self-end bg-lime" />
              </span>
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={menu} onClose={close} />
    </>
  );
};
