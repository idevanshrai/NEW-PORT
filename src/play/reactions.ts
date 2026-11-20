/**
 * Byte's reactions when you do something the world didn't plan for.
 * Each trigger has its own cooldown, and there's a short gap between any two
 * lines, so the chat stays funny instead of spammy.
 */
export type Reaction = 'edge' | 'terrain' | 'parkour' | 'speedrun' | 'idle' | 'lookdown' | 'reach' | 'night' | 'breaks50';

const LINES: Record<Reaction, string[]> = {
  edge: [
    "That's the edge of the world. Beyond it: nothing, and a very long fall.",
    'Bold move, walking on air. Blocks first, then walking.',
    "The void called. I told it you're busy reading a portfolio.",
  ],
  terrain: [
    'Those blocks are load-bearing. Devansh is standing on them.',
    'Nice try. The islands are bolted down; trees and crystals are fair game.',
  ],
  parkour: ['Parkour detected. +0 XP, +10 style.', 'Boing boing. Your knees must be made of springs.'],
  speedrun: [
    "Easy, speedrunner. The islands aren't going anywhere.",
    'Going for a world record? The real record is reading the whole thing.',
  ],
  idle: [
    "Still there? The trees won't chop themselves. Literally, I checked.",
    "AFK? I'll guard your stuff. There's nothing to guard, but still.",
  ],
  lookdown: ["Don't look down. Seriously, it's clouds all the way.", "That's a long way down. Even I'd need extra batteries."],
  reach: ["Your arms aren't that long.", "Closer! You're punching the air from here."],
  night: ['Night shift. Nothing spooky spawns here, just nice lanterns.'],
  breaks50: ["50 blocks! At this rate there'll be no portfolio left to look at."],
};

/** seconds before the same trigger can speak again (Infinity = once per visit) */
const COOLDOWN: Record<Reaction, number> = {
  edge: 30,
  terrain: 40,
  parkour: 60,
  speedrun: 90,
  idle: 60,
  lookdown: 60,
  reach: 30,
  night: 120,
  breaks50: Infinity,
};
const GAP = 4;

const last: Partial<Record<Reaction, number>> = {};
const turn: Partial<Record<Reaction, number>> = {};
let lastAny = -Infinity;

/** Say the next line for this trigger, if it isn't cooling down. Returns whether it spoke. */
export function react(r: Reaction, say: (text: string) => void) {
  const now = performance.now() / 1000;
  if (now - lastAny < GAP || now - (last[r] ?? -Infinity) < COOLDOWN[r]) return false;
  last[r] = now;
  lastAny = now;
  const lines = LINES[r];
  const i = (turn[r] ?? 0) % lines.length;
  turn[r] = i + 1;
  say(lines[i]);
  return true;
}

/** New visit to /play: cooldowns start over (so "once per visit" lines can speak again). */
export function resetReactions() {
  for (const k of Object.keys(last) as Reaction[]) delete last[k];
  lastAny = -Infinity;
}
