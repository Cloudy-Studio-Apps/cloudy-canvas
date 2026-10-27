import { Button } from "@shared/ui/kit";
import { freeGroup } from "../group-paths";
import { draftFromColor } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { NewGroupMenu } from "./new-group-menu";
import { t } from "../../../variables.i18n";

/** No collection yet: make one. An empty collection: start from one color, or add a group. */
export function EmptyCollection() {
  const { tokens, store, collection } = useBoard();
  const { setDraft, showCollection } = useVariablesWindowStore();
  if (!collection) {
    return (
      <div className="m-auto flex flex-col items-center gap-2.5 py-10 text-center text-xs text-muted-foreground">
        <b className="text-sm text-foreground">{t("board.emptyTitle")}</b>
        {t("board.emptyText")}
        <Button
          size="sm"
          onClick={() => showCollection(tokens.createCollection(t("defaults.collection")).id)}
        >
          {t("board.createCollection")}
        </Button>
      </div>
    );
  }
  return (
    <div className="m-auto flex flex-col items-center gap-2.5 py-10 text-center text-xs text-muted-foreground">
      <b className="text-sm text-foreground">{t("board.emptyCollection")}</b>
      {t("board.emptyCollectionText")}
      <Button
        size="sm"
        onClick={() =>
          setDraft(
            draftFromColor(collection.id, freeGroup(store.variables(collection.id), "brand")),
          )
        }
      >
        {t("board.startFromColor")}
      </Button>
      <NewGroupMenu />
    </div>
  );
}
