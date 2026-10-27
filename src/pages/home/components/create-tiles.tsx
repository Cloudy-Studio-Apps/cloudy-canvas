import { CATALOG_MODE_ID } from "@design";
import { CreateTile } from "./create-tile";
import { FileKindIcon } from "./file-kind-icon";
import type { CreateTilesProps } from "./create-tiles.types";
import { t } from "../home.i18n";

/** New board, New design and New catalog. */
export function CreateTiles({ onCreate, detailed }: CreateTilesProps) {
  const hints = detailed ? "welcome" : "create";
  return (
    <>
      <CreateTile
        icon={<FileKindIcon kind="board" />}
        title={t("create.board")}
        hint={t(`${hints}.boardHint`)}
        onSelect={() => onCreate("board")}
      />
      <CreateTile
        icon={<FileKindIcon kind="design" />}
        title={t("create.design")}
        hint={t(`${hints}.designHint`)}
        onSelect={() => onCreate("design")}
      />
      <CreateTile
        icon={<FileKindIcon kind="catalog" />}
        title={t("create.catalog")}
        hint={t(`${hints}.catalogHint`)}
        onSelect={() => onCreate("design", CATALOG_MODE_ID)}
      />
    </>
  );
}
