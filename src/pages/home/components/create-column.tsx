import { CreateTiles } from "./create-tiles";
import { NewProjectTile } from "./new-project-tile";
import { OpenFileTile } from "./open-file-tile";
import { SealCard } from "./seal-card";
import type { CreateColumnProps } from "./create-column.types";
import { t } from "../home.i18n";

/** Next to the Continue card: the "New …" tiles, Open file and the seals. */
export function CreateColumn({ onCreate, onOpenFile }: CreateColumnProps) {
  return (
    <nav aria-label={t("create.label")} className="flex flex-col gap-2.5">
      <CreateTiles onCreate={onCreate} />
      <NewProjectTile />
      <OpenFileTile onOpenFile={onOpenFile} />
      <SealCard />
    </nav>
  );
}
