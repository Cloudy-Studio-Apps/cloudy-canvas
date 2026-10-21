import type { LabeledProps, SectionProps } from "./section-layout.types";

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** A sample with a small monospace caption under it. */
export function Labeled({ label, children }: LabeledProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
