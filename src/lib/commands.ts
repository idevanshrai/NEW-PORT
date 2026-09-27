import { CAL_LINK, PROFILE, WORK } from '../data';
import { openResume } from './docs';
import { emit, toast, track } from './bus';
import { navigate } from './router';
import { toggleTheme } from './theme';
import { POSTS } from '../content/writing';

export type Command = {
  id: string;
  group: 'Go to' | 'Case studies' | 'Actions' | 'Links' | 'Fun';
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(PROFILE.email);
    toast(`Copied ${PROFILE.email}`);
  } catch {
    toast(PROFILE.email);
  }
  track('email_copy');
}

const open = (url: string) => window.open(url, '_blank', 'noopener');

export function buildCommands(): Command[] {
  const go = (id: string, label: string, keywords = ''): Command => ({
    id: `go-${id}`,
    group: 'Go to',
    label,
    keywords,
    run: () => navigate(`/#${id}`),
  });

  return [
    go('top', 'Home', 'start hero landing'),
    go('about', 'About', 'bio me'),
    go('experience', 'Experience', 'timeline jobs ibm internship'),
    go('work', 'Selected work', 'projects'),
    go('lab', 'Lab — smaller builds', 'projects experiments'),
    go('now', 'Now', 'currently'),
    go('certificates', 'Certificates', 'ibm certificate'),
    ...(POSTS.length ? [{ id: 'writing', group: 'Go to' as const, label: 'Writing', keywords: 'blog posts', run: () => navigate('/writing') }] : []),
    go('contact', 'Contact', 'email hire'),

    ...WORK.filter((w) => w.slug).map<Command>((w) => ({
      id: `cs-${w.slug}`,
      group: 'Case studies',
      label: w.name,
      hint: w.kind,
      run: () => navigate(`/work/${w.slug}`),
    })),

    { id: 'resume', group: 'Actions', label: 'Open résumé', keywords: 'cv pdf', run: openResume },
    { id: 'copy-email', group: 'Actions', label: 'Copy email address', hint: PROFILE.email, run: copyEmail },
    { id: 'email', group: 'Actions', label: 'Write me an email', run: () => (window.location.href = `mailto:${PROFILE.email}`) },
    ...(CAL_LINK ? [{ id: 'call', group: 'Actions' as const, label: 'Book a call', run: () => open(CAL_LINK) }] : []),
    { id: 'theme', group: 'Actions', label: 'Toggle light / dark', keywords: 'theme mode', run: toggleTheme },

    { id: 'github', group: 'Links', label: 'GitHub', hint: 'github.com/idevanshrai', run: () => open(PROFILE.github) },
    { id: 'linkedin', group: 'Links', label: 'LinkedIn', run: () => open(PROFILE.linkedin) },

    { id: 'play', group: 'Fun', label: 'Play mode — explore the voxel world', hint: 'P', keywords: 'game minecraft voxel', run: () => navigate('/play') },
    { id: 'terminal', group: 'Fun', label: 'Open the terminal', hint: 'or press `', keywords: 'shell console cli', run: () => emit('dr:terminal', 'open') },
    { id: 'scramble', group: 'Fun', label: 'Scramble the cube', keywords: 'rubik', run: () => emit('dr:cube', 'scramble') },
    { id: 'solve', group: 'Fun', label: 'Solve the cube', keywords: 'rubik', run: () => emit('dr:cube', 'solve') },
    { id: 'party', group: 'Fun', label: 'Party mode', keywords: 'confetti disco', run: () => emit('dr:cube', 'party') },
  ];
}
