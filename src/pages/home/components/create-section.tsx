import { FolderOpen } from "lucide-react";

import { CATALOG_MODE_ID } from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { CreateCard } from "./create-card";
import type { CreateSectionProps } from "./create-section.types";
import { t } from "../home.i18n";

export function CreateSection({ onCreate, onOpenFile }: CreateSectionProps) {
  return (
    <section aria-labelledby="create-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 id="create-heading" className="text-2xl font-semibold tracking-tight">
            {t("create.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("create.subtitle")}</p>
        </div>
        <Button variant="outline" onClick={onOpenFile} aria-keyshortcuts="Control+O">
          <FolderOpen />
          {t("create.open")}
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <CreateCard
          type="board"
          title={t("create.board")}
          description={t("create.boardHint")}
          onSelect={() => onCreate("board")}
        />
        <CreateCard
          type="design"
          title={t("create.design")}
          description={t("create.designHint")}
          onSelect={() => onCreate("design")}
        />
        <CreateCard
          type="design"
          title={t("create.catalog")}
          description={t("create.catalogHint")}
          onSelect={() => onCreate("design", CATALOG_MODE_ID)}
        />
      </div>
    </section>
  );
}
