import { ArrowRight } from "lucide-react";

import type { FileType } from "@shared/core";
import { FileTypeIcon } from "@shared/ui/components/file-type-icon";
import { cn } from "@shared/ui/lib/utils";
import type { CreateCardProps } from "./create-card.types";

const WASH: Record<FileType, string> = {
  board: "from-board-soft/60",
  design: "from-design-soft/60",
};

export function CreateCard({ type, title, description, onSelect }: CreateCardProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: Home's create card
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex min-h-40 cursor-pointer flex-col items-start gap-6 overflow-hidden rounded-card border bg-surface p-5 text-left shadow-soft",
        "bg-linear-to-br to-transparent to-60%",
        WASH[type],
        "transition-[box-shadow,border-color] duration-200",
        "hover:border-border-strong hover:shadow-lifted active:shadow-soft",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
      )}
    >
      <FileTypeIcon type={type} size="lg" />
      <div className="flex w-full items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRight
          aria-hidden="true"
          className="size-5 shrink-0 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </div>
    </button>
  );
}
