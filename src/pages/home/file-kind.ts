import { useCallback } from "react";
import { BookOpen } from "lucide-react";

import { CATALOG_MODE_ID } from "@design";
import { useDesignModeStore } from "@design/ui";
import type { FileInfo } from "@shared/core";
import type { FileTypeStyle } from "@shared/ui/components/file-type-icon.types";
import type { HomeFileKind } from "./file-kind.types";
import { t } from "./home.i18n";

/** A catalog's icon chip: the accent (blush) tint and a book. */
export const CATALOG_STYLE: FileTypeStyle = {
  icon: BookOpen,
  className: "bg-accent-soft text-accent-soft-foreground",
};

/** The soft wash behind a file's preview. */
export const KIND_TINT: Record<HomeFileKind, string> = {
  board: "bg-board-soft/60",
  design: "bg-design-soft/60",
  catalog: "bg-accent-soft/60",
};

export const KIND_LABEL: Record<HomeFileKind, string> = {
  board: t("card.board"),
  design: t("card.design"),
  catalog: t("card.catalog"),
};

/**
 * A design is a catalog when it was left in Catalog mode on this device (the mode each design was
 * left in is remembered per device, so one opened elsewhere shows as a design until it opens here).
 */
export function fileKindOf(file: FileInfo, modes: Record<string, string>): HomeFileKind {
  return file.type === "design" && modes[file.id] === CATALOG_MODE_ID ? "catalog" : file.type;
}

/** `fileKindOf` bound to the remembered modes, renewed when they change. */
export function useFileKindOf(): (file: FileInfo) => HomeFileKind {
  const modes = useDesignModeStore((s) => s.modes);
  return useCallback((file: FileInfo) => fileKindOf(file, modes), [modes]);
}

/** Whether a tab's value is one of the kinds (`all` isn't). */
export function isHomeFileKind(value: string): value is HomeFileKind {
  return value in KIND_LABEL;
}
