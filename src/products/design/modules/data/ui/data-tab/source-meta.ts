import { relativeTime } from "@shared/core";
import type { DataSourceElement } from "../../source";
import type { UpdateProgress } from "../../model";
import type { UpdateStage } from "../../update";
import { t } from "../../data.i18n";

/** What an Update is doing, in words (with how many pictures are in while it saves them). */
export function stageText(stage: UpdateStage, progress: UpdateProgress | null = null): string {
  if (stage === "fetching") return t("update.stage.fetching");
  if (stage === "parsing") return t("update.stage.parsing");
  if (stage === "images") {
    return progress && progress.total > 0
      ? t("update.stage.imagesProgress", { done: progress.done, total: progress.total })
      : t("update.stage.images");
  }
  return t("update.stage.saving");
}

/** A source's status line: "12 rows · updated 3 days ago", or that it was never updated. */
export function sourceMeta(source: DataSourceElement): string {
  const snapshot = source.snapshot;
  if (!snapshot) return t("source.neverUpdated");
  const rows = t("source.rows", { count: snapshot.rowCount });
  const ago = relativeTime(snapshot.updatedAt);
  const updated = ago ? t("source.updatedAgo", { time: ago }) : t("source.updatedNow");
  return `${rows} · ${updated}`;
}
