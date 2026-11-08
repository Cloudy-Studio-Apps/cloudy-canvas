import { formatSize } from "@shared/core";
import { Button } from "@shared/ui/kit";
import { useProjectContext } from "./project-context";
import type { ProjectFooterProps } from "./project-footer.types";
import { useProjectSize } from "./use-project-size";
import { t } from "./project.i18n";

/** The strip under the project: how much is in the trash (Open trash) and the project's size. */
export function ProjectFooter({ onOpenTrash }: ProjectFooterProps) {
  const { record, trash, scanRev } = useProjectContext();
  const size = useProjectSize(record.root, scanRev);
  return (
    <footer className="flex h-8 shrink-0 items-center gap-3 border-t bg-surface px-4 text-xs text-muted-foreground">
      <span>
        {trash.count === 0
          ? t("footer.trashEmpty")
          : t("footer.trash", { count: trash.count, size: formatSize(trash.size) })}
      </span>
      <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onOpenTrash}>
        {t("footer.openTrash")}
      </Button>
      <span className="ml-auto tabular-nums">
        {size === null ? "" : t("footer.size", { size: formatSize(size) })}
      </span>
    </footer>
  );
}
