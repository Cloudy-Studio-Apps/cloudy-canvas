import type { StopEase } from "@canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import type { StopEaseSelectProps } from "./stop-ease-select.types";
import { t } from "../../design-ui.i18n";

const EASES: { id: StopEase; label: string }[] = [
  { id: "linear", label: t("gradient.ease.linear") },
  { id: "ease-in", label: t("gradient.ease.in") },
  { id: "ease-out", label: t("gradient.ease.out") },
  { id: "ease-in-out", label: t("gradient.ease.inOut") },
];

/** How the selected stop blends into the next one. */
export function StopEaseSelect({ value, onChange }: StopEaseSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs text-muted-foreground">
        {t("gradient.ease.blendToNext")}
      </span>
      <Select value={value} onValueChange={(next) => onChange(next as StopEase)}>
        <SelectTrigger aria-label={t("gradient.ease.label")} className="h-7 flex-1 text-xs">
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
