import { SealLogo } from "@ui/brand/seal-logo";
import { Wordmark } from "@ui/brand/wordmark";
import { Separator } from "@ui/components/ui/separator";
import { Labeled, Section } from "./section-layout";

export function LogoSection() {
  return (
    <Section title="Logo" description="The foca watona peeking over a canvas.">
      <div className="flex flex-wrap items-end gap-8 rounded-card border bg-surface p-6">
        {[128, 64, 32].map((size) => (
          <Labeled key={size} label={`full · ${size}px`}>
            <SealLogo size={size} />
          </Labeled>
        ))}
        {[24, 16].map((size) => (
          <Labeled key={size} label={`mark · ${size}px`}>
            <SealLogo size={size} variant="mark" />
          </Labeled>
        ))}
        <Separator orientation="vertical" className="h-16!" />
        <Labeled label="wordmark">
          <Wordmark />
        </Labeled>
      </div>
    </Section>
  );
}
