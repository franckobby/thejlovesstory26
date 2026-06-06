import clsx from "clsx";

export function Ornament({
  className,
  color,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={clsx("ornament", className)}
      style={color ? { color } : undefined}
      aria-hidden
    >
      <svg width="46" height="14" viewBox="0 0 46 14" fill="none">
        <path d="M23 1 L27 7 L23 13 L19 7 Z" fill="currentColor" opacity="0.95" />
        <path d="M19 7 L11 7 M27 7 L35 7" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
        <circle cx="8" cy="7" r="1.6" fill="currentColor" />
        <circle cx="38" cy="7" r="1.6" fill="currentColor" />
      </svg>
    </div>
  );
}
