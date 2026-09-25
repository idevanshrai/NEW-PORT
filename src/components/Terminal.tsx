import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CERTIFICATES, EXPERIENCE, LAB, NOW, PROFILE, WORK } from '../data';
import { POSTS } from '../content/writing';
import { emit, findSecret, foundSecrets, on, SECRETS, track } from '../lib/bus';
import { copyEmail } from '../lib/commands';
import { lockScroll } from '../lib/lenis';
import { navigate } from '../lib/router';
import { getTheme, setTheme } from '../lib/theme';
import { openResume } from '../lib/docs';

type Line = { id: number; node: ReactNode };
let seq = 0;

const SECTIONS = ['about', 'experience', 'work', 'lab', 'now', 'certificates', 'github', 'contact'];
const COMMANDS = [
  'help', 'whoami', 'neofetch', 'ls', 'cd', 'cat', 'projects', 'open', 'experience', 'now', 'certs',
  'resume', 'email', 'contact', 'github', 'linkedin', 'theme', 'cube', 'secrets', 'history', 'date',
  'echo', 'clear', 'exit', 'hire', 'sudo', 'coffee', 'vim',
];

const A = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="text-lime underline decoration-dotted underline-offset-4 hover:no-underline">
    {children}
  </button>
);

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** The hidden terminal — press ` (backtick) anywhere, or pick it from ⌘K. */
export const Terminal = () => {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const print = (...nodes: ReactNode[]) => setLines((ls) => [...ls, ...nodes.map((node) => ({ id: ++seq, node }))]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
      if ((e.key === '`' || e.key === '~') && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    const off = on('dr:terminal', (a) => setOpen((o) => (a === 'toggle' ? !o : a === 'open')));
    return () => {
      window.removeEventListener('keydown', onKey);
      off();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    findSecret('terminal');
    track('terminal_open');
    lockScroll(true);
    setLines((ls) =>
      ls.length
        ? ls
        : [
            { id: ++seq, node: <span className="text-mute">DR-SYSTEM-BOOT v3.0 · kernel ok · creativity.so loaded</span> },
            { id: ++seq, node: <span>Welcome. Type <span className="text-lime">help</span> to see what I can do. <span className="text-mute">(esc or ` to close)</span></span> },
          ],
    );
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => lockScroll(false);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const close = () => setOpen(false);
  const goto = (path: string) => {
    close();
    setTimeout(() => navigate(path), 80);
  };

  const run = (raw: string) => {
    const cmdline = raw.trim();
    print(
      <span>
        <span className="text-lime">devansh@portfolio</span>
        <span className="text-mute">:~$</span> {cmdline}
      </span>,
    );
    if (!cmdline) return;
    setHist((h) => [...h.filter((x) => x !== cmdline), cmdline]);
    track('terminal_cmd', { cmd: cmdline.split(' ')[0] });

    const [cmd, ...args] = cmdline.split(/\s+/);
    const arg = args.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        print(
          <div className="grid grid-cols-[9rem_1fr] gap-x-4 text-mute">
            {[
              ['whoami', 'the short version'],
              ['neofetch', 'the nerdy version'],
              ['ls / cd <section>', 'look around, jump somewhere'],
              ['projects', 'everything I’ve built'],
              ['open <project>', 'case study or repo'],
              ['experience', 'where I’ve worked'],
              ['now', 'what I’m up to'],
              ['certs', 'certificates'],
              ['resume', 'open my résumé'],
              ['email', 'copy my email'],
              ['theme light|dark', 'change the lights'],
              ['cube scramble|solve|party', 'mess with the cube'],
              ['secrets', 'easter eggs found'],
              ['clear / exit', 'tidy up / leave'],
            ].map(([a, b]) => (
              <span key={a} className="contents">
                <span className="text-paper">{a}</span>
                <span>{b}</span>
              </span>
            ))}
          </div>,
        );
        break;
      case 'whoami':
        print(`${PROFILE.name} — ${PROFILE.intro}`);
        break;
      case 'neofetch': {
        const found = foundSecrets().length;
        print(
          <pre className="leading-tight">
            <span className="text-lime">{`   ▄▄▄▄▄▄▄   `}</span>
            <span className="text-paper">devansh</span>@<span className="text-paper">portfolio</span>
            {'\n'}
            <span className="text-lime">{`  █ ▀▀▀▀▀ █  `}</span>-----------------{'\n'}
            <span className="text-lime">{`  █ █▀▀▀█ █  `}</span>OS: VIT B.Tech CSE (AI/ML) ’27{'\n'}
            <span className="text-lime">{`  █ █▄▄▄█ █  `}</span>Host: IBM India Software Labs{'\n'}
            <span className="text-lime">{`  █▄▄▄▄▄▄▄█  `}</span>Shell: Python · Swift · TypeScript{'\n'}
            <span className="text-lime">{`             `}</span>Uptime: robots since 2019{'\n'}
            <span className="text-lime">{`             `}</span>Projects: {WORK.length + LAB.length} shown, 50+ on GitHub{'\n'}
            <span className="text-lime">{`             `}</span>Secrets: {found}/{Object.keys(SECRETS).length}
          </pre>,
        );
        break;
      }
      case 'ls':
        print(
          <span className="flex flex-wrap gap-x-5">
            {SECTIONS.map((s) => (
              <A key={s} onClick={() => goto(`/#${s}`)}>{`${s}/`}</A>
            ))}
            <span className="text-mute">about.txt resume.pdf</span>
          </span>,
        );
        break;
      case 'cd': {
        const target = arg.replace(/\/$/, '').replace(/^~\/?/, '');
        if (!target || target === '~' || target === '/') goto('/#top');
        else if (SECTIONS.includes(target)) goto(`/#${target}`);
        else if (target === 'writing' && POSTS.length) goto('/writing');
        else if (target === '..') print('You’re already at the top. There’s no escaping this portfolio.');
        else print(`cd: no such section: ${target} — try ls`);
        break;
      }
      case 'cat':
        if (arg === 'about.txt') PROFILE.about.forEach((p) => print(p));
        else if (arg === 'resume.pdf') print('That’s a binary file. Try `resume` instead.');
        else print(`cat: ${arg || '(nothing)'}: no such file — try ls`);
        break;
      case 'projects':
        print(<span className="text-mute">Featured:</span>);
        WORK.forEach((w) =>
          print(
            <span>
              <A onClick={() => goto(`/work/${w.slug}`)}>{w.name}</A> <span className="text-mute">— {w.kind}, {w.year}</span>
            </span>,
          ),
        );
        print(<span className="text-mute">Lab:</span>);
        LAB.forEach((w) => print(<span>{w.name} <span className="text-mute">— {w.blurb}</span></span>));
        print(<span className="text-mute">Type `open &lt;name&gt;`.</span>);
        break;
      case 'open': {
        const q = slugOf(arg);
        const w = WORK.find((x) => slugOf(x.name).includes(q) || x.slug === q);
        const l = LAB.find((x) => slugOf(x.name).includes(q));
        if (!q) print('open what? try `projects`');
        else if (w?.slug) goto(`/work/${w.slug}`);
        else if (l) {
          window.open(l.live ?? l.repo, '_blank', 'noopener');
          print(`Opening ${l.name}…`);
        } else print(`open: couldn’t find “${arg}”`);
        break;
      }
      case 'experience':
        EXPERIENCE.forEach((r) => print(<span><span className="text-paper">{r.org}</span> <span className="text-mute">— {r.role}, {r.period}</span></span>));
        break;
      case 'now':
        print(<span className="text-mute">Updated {NOW.updated}</span>);
        NOW.items.filter((i) => !i.v.startsWith('TODO')).forEach((i) => print(<span><span className="text-lime">{i.k}:</span> {i.v}</span>));
        break;
      case 'certs':
      case 'certificates':
        CERTIFICATES.forEach((c) => print(<span>{c.title} <span className="text-mute">— {c.issuer}, {c.date}</span></span>));
        print(<A onClick={() => goto('/#certificates')}>see them all</A>);
        break;
      case 'resume':
      case 'cv':
        close();
        setTimeout(openResume, 80);
        break;
      case 'email':
      case 'contact':
        copyEmail();
        print(`Copied ${PROFILE.email} — say hi.`);
        break;
      case 'github':
        window.open(PROFILE.github, '_blank', 'noopener');
        break;
      case 'linkedin':
        window.open(PROFILE.linkedin, '_blank', 'noopener');
        break;
      case 'theme': {
        const t = arg === 'light' || arg === 'dark' ? arg : getTheme() === 'light' ? 'dark' : 'light';
        setTheme(t);
        print(`Theme set to ${t}.`);
        break;
      }
      case 'cube': {
        const a = (['scramble', 'solve', 'party', 'explode'] as const).find((x) => x === arg);
        if (!a) print('usage: cube scramble | solve | party | explode');
        else {
          emit('dr:cube', a);
          print(a === 'solve' ? 'Solving… scroll to the top to watch.' : `cube: ${a}!`);
        }
        break;
      }
      case 'secrets': {
        const have = foundSecrets();
        (Object.keys(SECRETS) as (keyof typeof SECRETS)[]).forEach((k) =>
          print(have.includes(k) ? <span><span className="text-lime">✓</span> {SECRETS[k]}</span> : <span className="text-mute">· ???</span>),
        );
        print(<span className="text-mute">{have.length}/{Object.keys(SECRETS).length} found</span>);
        break;
      }
      case 'history':
        hist.forEach((h, i) => print(<span className="text-mute">{String(i + 1).padStart(3, ' ')}  {h}</span>));
        break;
      case 'date':
        print(new Date().toString());
        break;
      case 'echo':
        print(arg);
        break;
      case 'clear':
        setLines([]);
        break;
      case 'exit':
      case 'quit':
        close();
        break;
      case 'hire':
        print('Great decision. Opening your mail app…');
        window.location.href = `mailto:${PROFILE.email}?subject=Let%27s%20work%20together`;
        break;
      case 'sudo':
        if (/hire/.test(arg)) {
          findSecret('sudo');
          print(<span className="text-lime">[sudo] password for recruiter: ******** — access granted. Offer letter pending ✓</span>);
        } else if (/rm\s+-rf/.test(arg)) print('Nice try. This portfolio is write-protected.');
        else print('devansh is not in the sudoers file. This incident will be reported.');
        break;
      case 'rm':
        print('rm: permission denied (and a little rude).');
        break;
      case 'coffee':
        print('☕ Brewing… done. Now we’re both productive.');
        break;
      case 'vim':
        print('You’re in vim now. Just kidding — type `exit`. You’re welcome.');
        break;
      default:
        print(`command not found: ${cmd} — type help`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
      setHi(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const n = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
      if (hist[n]) {
        setHi(n);
        setInput(hist[n]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = hi + 1;
      if (n >= hist.length) {
        setHi(-1);
        setInput('');
      } else {
        setHi(n);
        setInput(hist[n]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const [c, ...rest] = input.split(' ');
      if (!rest.length) {
        const m = COMMANDS.filter((x) => x.startsWith(c.toLowerCase()));
        if (m.length === 1) setInput(m[0] + ' ');
        else if (m.length > 1) print(<span className="text-mute">{m.join('  ')}</span>);
      } else if (c === 'cd') {
        const m = SECTIONS.filter((x) => x.startsWith(rest.join(' ')));
        if (m.length === 1) setInput(`cd ${m[0]}`);
      }
    } else if (e.key === 'Escape' || (e.key === '`' && !input)) {
      e.preventDefault();
      close();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[110] px-3 pb-3 md:px-10 md:pb-8"
          initial={{ y: '105%' }}
          animate={{ y: 0 }}
          exit={{ y: '105%' }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          data-lenis-prevent
        >
          <div
            role="dialog"
            aria-label="Terminal"
            className="mx-auto flex h-[62svh] max-w-4xl flex-col overflow-hidden border border-line bg-[#0a0a09] font-mono text-[13px] text-[#ecebe4] shadow-[0_-20px_80px_rgba(0,0,0,0.5)]"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center justify-between border-b border-[#2a2a26] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[#8b8a80]">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3">devansh@portfolio — zsh</span>
              </span>
              <button onClick={close} className="hover:text-[#ecebe4]">
                esc ✕
              </button>
            </div>
            <div ref={scroller} className="flex-1 space-y-1 overflow-y-auto px-4 py-3 leading-relaxed [&_.text-lime]:text-[#c8ff2e] [&_.text-mute]:text-[#8b8a80] [&_.text-paper]:text-[#ecebe4]">
              {lines.map((l) => (
                <div key={l.id} className="whitespace-pre-wrap break-words">
                  {l.node}
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="shrink-0">
                  <span className="text-[#c8ff2e]">devansh@portfolio</span>
                  <span className="text-[#8b8a80]">:~$</span>
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  aria-label="Terminal input"
                  className="flex-1 bg-transparent caret-[#c8ff2e] outline-none"
                />
              </div>
            </div>
            {/* one-tap commands — handy on phones where typing is a pain */}
            <div className="flex gap-2 overflow-x-auto border-t border-[#2a2a26] px-3 py-2">
              {['help', 'whoami', 'neofetch', 'projects', 'now', 'secrets', 'cube party', 'sudo hire devansh'].map((c) => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation();
                    run(c);
                  }}
                  className="shrink-0 border border-[#2a2a26] px-2.5 py-1 text-[11px] text-[#8b8a80] transition-colors hover:border-[#c8ff2e] hover:text-[#c8ff2e]"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
