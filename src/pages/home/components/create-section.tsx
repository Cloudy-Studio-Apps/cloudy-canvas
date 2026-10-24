import { FolderOpen } from "lucide-react";

import { CATALOG_MODE_ID } from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { CreateCard } from "./create-card";
import type { CreateSectionProps } from "./create-section.types";

export function CreateSection({ onCreate, onOpenFile }: CreateSectionProps) {
  return (
    <section aria-labelledby="create-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 id="create-heading" className="text-2xl font-semibold tracking-tight">
            Create new
          </h1>
          <p className="text-sm text-muted-foreground">
            Start from a blank board, design or catalog.
          </p>
        </div>
        <Button variant="outline" onClick={onOpenFile} aria-keyshortcuts="Control+O">
          <FolderOpen />
          Open file…
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <CreateCard
          type="board"
          title="New Board"
          description="Brainstorm, map ideas, sticky notes"
          onSelect={() => onCreate("board")}
        />
        <CreateCard
          type="design"
          title="New Design"
          description="Design interfaces and visuals"
          onSelect={() => onCreate("design")}
        />
        <CreateCard
          type="design"
          title="New Catalog"
          description="Brochures and catalogs to print, page by page"
          onSelect={() => onCreate("design", CATALOG_MODE_ID)}
        />
      </div>
    </section>
  );
}
