import type { StopEase } from "@canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import type { StopEaseSelectProps } from "./stop-ease-select.types";

const EASES: { id: StopEase; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "ease-in", label: "Ease in" },
  { id: "ease-out", label: "Ease out" },
  { id: "ease-in-out", label: "Ease in and out" },
];

/** How the selected stop blends into the next one. */
export function StopEaseSelect({ value, onChange }: StopEaseSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs text-muted-foreground">Blend to next</span>
      <Select value={value} onValueChange={(next) => onChange(next as StopEase)}>
        <SelectTrigger aria-label="Blend to the next stop" className="h-7 flex-1 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EASES.map((ease) => (
            <SelectItem key={ease.id} value={ease.id}>
              {ease.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
