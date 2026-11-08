import type { CanvasEngine } from "@canvas";

import { toast } from "@shared/stores/toast-store";
import { playTarget, prototypeSelection } from "../../model";
import { PROTOTYPE_MODE_ID } from "../../prototype.constants";
import { usePrototypeViewStore } from "../stores/prototype-view-store";
import { usePlayerStore } from "./player-store";
import { t } from "../../prototype.i18n";

/**
 * The Play command (Ctrl+Enter): opens the player on what the selection points at (`playTarget`),
 * or says to add a flow first when the page has none. Only in the Prototype mode, where the player
 * is mounted.
 */
export function playFromSelection(engine: CanvasEngine): void {
  if (engine.getState().mode !== PROTOTYPE_MODE_ID) return;
  const page = engine.scope;
  const picked = usePrototypeViewStore.getState().selectedFlow;
  const selection = prototypeSelection(engine.doc, engine.selectedIds(), picked);
  const target = page === null ? null : playTarget(engine.doc, page, selection);
  if (target) usePlayerStore.getState().open(target);
  else toast({ title: t("player.noFlow") });
}
