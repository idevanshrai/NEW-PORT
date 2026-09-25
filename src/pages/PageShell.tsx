import { useEffect, type ReactNode } from 'react';

/** Wrapper for inner pages: sets the tab title and leaves room under the fixed nav. */
export const PageShell = ({ title, children }: { title: string; children: ReactNode }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — Devansh Rai`;
    return () => {
      document.title = prev;
    };
  }, [title]);
  return <div className="px-5 pb-24 pt-28 md:px-10 md:pt-36">{children}</div>;
};

export const Back = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="label link-underline inline-block text-paper">
    ← {children}
  </a>
);
