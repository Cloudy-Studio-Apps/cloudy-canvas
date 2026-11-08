import { formatSize } from "@shared/core";
import type { SpaceBarProps } from "./projects-storage.types";
import { t } from "../../settings.i18n";

/** The space used, split into files, library assets and trash. */
export function SpaceBar({ sizes }: SpaceBarProps) {
  const parts = [
    { id: "files", label: t("storage.files"), bytes: sizes.files, color: "bg-primary" },
    { id: "assets", label: t("storage.assets"), bytes: sizes.libraries, color: "bg-accent" },
    { id: "trash", label: t("storage.trash"), bytes: sizes.trash, color: "bg-border-strong" },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <b className="text-sm">{t("storage.spaceUsed")}</b>
        <span className="text-sm tabular-nums">{formatSize(sizes.total)}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-sm bg-surface-sunken">
        {parts.map((part) => (
          <i
            key={part.id}
            className={part.color}
            style={{ width: `${sizes.total > 0 ? (part.bytes / sizes.total) * 100 : 0}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {parts.map((part) => (
          <span key={part.id} className="flex items-center gap-1.5">
            <i className={`size-2 rounded-sm ${part.color}`} />
            {part.label} · {formatSize(part.bytes)}
          </span>
        ))}
      </div>
    </div>
  );
}
