import type { AboutBlockProps } from "./about-dialog.types";

/** One titled part of the About dialog, below a divider. */
export function AboutBlock({ title, children }: AboutBlockProps) {
  return (
    <section className="space-y-2 border-t px-6 py-4 text-xs leading-relaxed text-muted-foreground">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}
