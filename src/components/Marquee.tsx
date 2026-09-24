const ITEMS = [
  'Agentic AI',
  'RAG',
  'MCP servers',
  'Swift & SwiftUI',
  'Python',
  'FastAPI',
  'TypeScript',
  'React',
  'Three.js',
  'OpenCV',
  'PyTorch',
  'Arduino',
];

/** Slow, endless ticker of what I work with. Pauses on hover; static for reduced motion. */
export const Marquee = () => {
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-10 pr-10 motion-safe:animate-marquee md:gap-14 md:pr-14">
      {ITEMS.map((t, i) => (
        <li key={t} className="flex items-center gap-10 md:gap-14">
          <span className={`display whitespace-nowrap text-4xl md:text-6xl ${i % 2 ? 'text-mute' : 'text-paper'}`}>{t}</span>
          <span className="text-2xl text-lime md:text-3xl">✳</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Tools I work with" className="group relative z-10 overflow-hidden border-y border-line bg-ink py-6 md:py-8">
      <div className="flex w-max group-hover:[&>ul]:[animation-play-state:paused]">
        {row()}
        {row(true)}
      </div>
    </section>
  );
};
