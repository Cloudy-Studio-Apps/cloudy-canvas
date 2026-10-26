import type { PreviewButtonProps } from "./preview.types";

/** A button as a sample design draws it (not a real one). */
export function PreviewButton({ bg, fg, border, children, small }: PreviewButtonProps) {
  return (
    <span
      className={
        small
          ? "inline-flex h-7 items-center rounded-md px-3 text-xs font-semibold"
          : "inline-flex h-8.5 items-center rounded-md px-3.5 text-[13px] font-semibold"
      }
      style={{ background: bg, color: fg, border: `1px solid ${border ?? bg}` }}
    >
      {children}
    </span>
  );
}
