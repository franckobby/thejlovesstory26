import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

/**
 * Fade-and-rise entrance, driven by a pure CSS animation that runs on mount.
 * No JS / IntersectionObserver, so content is always guaranteed to appear.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx("reveal-rise", className)}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-y": `${y}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
