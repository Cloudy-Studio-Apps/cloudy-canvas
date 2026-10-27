import { cn } from "@shared/ui/kit";
import { KIND_LABEL, KIND_TINT } from "../file-kind";
import { FileKindIcon } from "./file-kind-icon";
import type { StarterCardProps } from "./starter-card.types";
import { t } from "../home.i18n";

/** A starter on Home: its picture on its product's tint, and its name. */
export function StarterCard({ starter, onSelect }: StarterCardProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: Home's starter card with its picture
    <button
      type="button"
      onClick={onSelect}
      title={starter.description}
      aria-label={t("starters.label", {
        type: KIND_LABEL[starter.type].toLowerCase(),
        name: starter.label,
      })}
      className={cn(
        "flex w-full cursor-pointer flex-col overflow-hidden rounded-card border bg-surface text-left shadow-soft",
        "transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-lifted",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
      )}
    >
      <span
        className={cn("flex aspect-[4/3] items-center justify-center p-3", KIND_TINT[starter.type])}
      >
        <img src={starter.preview} alt="" draggable={false} className="size-full object-contain" />
      </span>
      <span className="flex items-center gap-2 border-t px-2.5 py-2 text-sm font-medium">
        <FileKindIcon kind={starter.type} size="sm" className="size-5 [&_svg]:size-3" />
        <span className="truncate">{starter.label}</span>
      </span>
    </button>
  );
}
