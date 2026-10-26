import { Button } from "@shared/ui/kit";
import { freeGroup } from "../group-paths";
import { draftFromColor } from "../shade-drafts";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { NewGroupMenu } from "./new-group-menu";

/** No collection yet: make one. An empty collection: start from one color, or add a group. */
export function EmptyCollection() {
  const { tokens, store, collection } = useBoard();
  const { setDraft, showCollection } = useVariablesWindowStore();
  if (!collection) {
    return (
      <div className="m-auto flex flex-col items-center gap-2.5 py-10 text-center text-xs text-muted-foreground">
        <b className="text-sm text-foreground">No variables yet</b>
        Variables hold the colors and numbers your layers reuse, grouped in collections.
        <Button size="sm" onClick={() => showCollection(tokens.createCollection("Brand").id)}>
          Create a collection
        </Button>
      </div>
    );
  }
  return (
    <div className="m-auto flex flex-col items-center gap-2.5 py-10 text-center text-xs text-muted-foreground">
      <b className="text-sm text-foreground">An empty collection</b>
      Start from one color and get its shades, or add variables group by group.
      <Button
        size="sm"
        onClick={() =>
          setDraft(
            draftFromColor(collection.id, freeGroup(store.variables(collection.id), "brand")),
          )
        }
      >
        Start from a color
      </Button>
      <NewGroupMenu />
    </div>
  );
}
