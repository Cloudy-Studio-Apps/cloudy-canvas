import type { ElementPatch } from "@canvas";
import type { LineCap, LineNodeElement } from "@design";
import { PanelSection, PropertyGrid } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";

const CAPS: { id: LineCap; label: string }[] = [
  { id: "none", label: "None" },
  { id: "arrow", label: "Arrow" },
];

/** For selected lines: what each end looks like (an arrowhead or nothing). */
export function LineSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();
  const lines = nodes as readonly LineNodeElement[];

  const capField = (which: "startCap" | "endCap", label: string) => {
    const first = lines[0]?.[which];
    const shared = lines.every((line) => line[which] === first) ? first : undefined;
    return (
      <Select
        value={shared}
        onValueChange={(value) =>
          edit(
            lines,
            () =>
              ({ [which]: value === "arrow" ? "arrow" : "none" }) as ElementPatch<LineNodeElement>,
          )
        }
      >
        <SelectTrigger aria-label={label} className="h-7 w-full text-xs">
          <SelectValue placeholder="Mixed" />
        </SelectTrigger>
        <SelectContent>
          {CAPS.map((cap) => (
            <SelectItem key={cap.id} value={cap.id}>
              {label}: {cap.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <PanelSection title="Line">
      <PropertyGrid>
        {capField("startCap", "Start")}
        {capField("endCap", "End")}
      </PropertyGrid>
    </PanelSection>
  );
}
