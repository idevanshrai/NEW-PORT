import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { on, track } from '../lib/bus';
import { buildCommands, type Command } from '../lib/commands';
import { lockScroll } from '../lib/lenis';

/** Loose "all letters in order" match, scored by how tight the match is. */
function score(q: string, text: string) {
  if (!q) return 1;
  const t = text.toLowerCase();
  let gaps = 0;
  let last = -1;
  for (const ch of q.toLowerCase()) {
    const at = t.indexOf(ch, last + 1);
    if (at < 0) return 0;
    if (last >= 0) gaps += at - last - 1;
    last = at;
  }
  return 1 / (1 + gaps) + (t.startsWith(q.toLowerCase()) ? 1 : 0);
}

/** ⌘K / Ctrl+K — jump anywhere or run an action from the keyboard. */
export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const commands = useMemo(() => buildCommands(), []);

  const results = useMemo(
    () =>
      commands
        .map((c) => ({ c, s: score(q, `${c.label} ${c.keywords ?? ''} ${c.group}`) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => (q ? b.s - a.s : 0))
        .map((r) => r.c),
    [commands, q],
  );

  const show = (v: boolean) => {
    setOpen(v);
    setQ('');
    setSel(0);
    if (v) track('palette_open');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQ('');
        setSel(0);
      }
    };
    window.addEventListener('keydown', onKey);
    const off = on('dr:palette', (a) => setOpen((o) => (a === 'toggle' ? !o : a === 'open')));
    return () => {
      window.removeEventListener('keydown', onKey);
      off();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    requestAnimationFrame(() => input.current?.focus());
    return () => lockScroll(false);
  }, [open]);

  useEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const run = (c: Command) => {
    show(false);
    track('palette_run', { id: c.id });
    // let the palette close first so scrolling isn't locked
    setTimeout(c.run, 60);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter' && results[sel]) {
      e.preventDefault();
      run(results[sel]);
    } else if (e.key === 'Escape') {
      show(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/70 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => show(false)}
          data-lenis-prevent
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="w-full max-w-xl overflow-hidden border border-line bg-char shadow-2xl"
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <span className="font-mono text-lime">❯</span>
              <input
                ref={input}
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search…"
                className="h-14 flex-1 bg-transparent font-mono text-sm text-paper placeholder:text-mute focus:outline-none"
                aria-controls="palette-list"
                aria-activedescendant={results[sel] ? `cmd-${results[sel].id}` : undefined}
              />
              <kbd className="font-mono text-[10px] text-mute">ESC</kbd>
            </div>
            <ul ref={list} id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 && <li className="px-4 py-6 text-center font-mono text-xs text-mute">No matches. Try “terminal”.</li>}
              {results.map((c, i) => {
                const header = !q && (i === 0 || results[i - 1].group !== c.group);
                return (
                  <li key={c.id}>
                    {header && <p className="label px-4 pb-1 pt-3">{c.group}</p>}
                    <button
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={i === sel}
                      data-active={i === sel}
                      onMouseMove={() => setSel(i)}
                      onClick={() => run(c)}
                      className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === sel ? 'bg-lime text-onlime' : 'text-paper'
                      }`}
                    >
                      <span>{c.label}</span>
                      {c.hint && <span className={`truncate font-mono text-[11px] ${i === sel ? 'text-onlime/70' : 'text-mute'}`}>{c.hint}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between border-t border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
              <span>↑↓ move · ↵ run</span>
              <span>` opens the terminal</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
