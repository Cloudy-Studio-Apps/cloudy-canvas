import type { IsaVennProps } from "./entity-form.types";

const PATHS = {
  overlapping: (
    <>
      <circle cx="21" cy="16" r="10" />
      <circle cx="31" cy="16" r="10" />
    </>
  ),
  exclusive: (
    <>
      <circle cx="15" cy="16" r="9" />
      <circle cx="37" cy="16" r="9" />
    </>
  ),
  partial: (
    <>
      <rect x="6" y="3" width="40" height="26" />
      <circle cx="18" cy="16" r="6.5" fill="currentColor" />
      <circle cx="34" cy="16" r="6.5" fill="currentColor" />
    </>
  ),
  total: (
    <>
      <path d="M6 3h20v26H6z" fill="currentColor" />
      <path d="M26 3h20v26H26z" fill="currentColor" opacity={0.55} />
    </>
  ),
};

/** Sets showing what a hierarchy's choice means. */
export function IsaVenn({ kind }: IsaVennProps) {
  return (
    <svg
      viewBox="0 0 52 32"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-8 w-[52px]"
    >
      {PATHS[kind]}
    </svg>
  );
}
