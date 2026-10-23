import { cn } from "@shared/ui/lib/utils";
import { ErSettingPreview } from "./diagram-setting-preview";
import type { ErSettingOptionProps } from "./diagram-settings.types";

/** One choice of a setting: its picture and its name; the chosen one is highlighted. */
export function ErSettingOption({
  setting,
  value,
  label,
  selected,
  onSelect,
}: ErSettingOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-md border px-1 pt-1 pb-1.5 text-xs outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/25",
        selected
          ? "border-primary bg-primary-soft text-primary-soft-foreground"
          : "border-border text-muted-foreground hover:bg-hover hover:text-foreground",
      )}
      onClick={onSelect}
    >
      <ErSettingPreview setting={setting} value={value} />
      {label}
    </button>
  );
}
