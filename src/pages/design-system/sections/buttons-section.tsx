import { Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { Separator } from "@shared/ui/components/ui/separator";
import { Section } from "./section-layout";
import type { RowLabelProps } from "./buttons-section.types";

const VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "accent",
  "destructive",
  "link",
] as const;
const SIZES = ["sm", "default", "lg"] as const;

function RowLabel({ children }: RowLabelProps) {
  return <span className="w-16 font-mono text-xs text-muted-foreground">{children}</span>;
}

export function ButtonsSection() {
  return (
    <Section title="Buttons">
      <div className="space-y-4 rounded-card border bg-surface p-6">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-3">
            <RowLabel>{size}</RowLabel>
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} size={size}>
                {variant}
              </Button>
            ))}
          </div>
        ))}
        <Separator />
        <div className="flex flex-wrap items-center gap-3">
          <RowLabel>misc</RowLabel>
          <Button>
            <Plus />
            New board
          </Button>
          <Button variant="outline" size="icon" aria-label="Search">
            <Search />
          </Button>
          <Button variant="destructive">
            <Trash2 />
            Delete
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </Section>
  );
}
