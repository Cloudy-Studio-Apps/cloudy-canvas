import { TYPE_SCALE } from "../tokens";
import { Section } from "./section-layout";

export function TypographySection() {
  return (
    <Section title="Typography" description="Inter Variable · desktop scale with a 14px base.">
      <div className="divide-y rounded-card border bg-surface">
        {TYPE_SCALE.map(({ token, className, size }) => (
          <div key={token} className="flex items-baseline gap-6 px-5 py-3">
            <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">
              {token} · {size}
            </span>
            <span className={`${className} truncate`}>Brainstorm with the seal</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
