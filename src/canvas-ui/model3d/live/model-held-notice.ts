import { MODEL_EDIT_LOCKS } from "@canvas";
import type { CanvasEngine } from "@canvas";
import { toast } from "@shared/stores/toast-store";

import { t } from "../model3d.i18n";

/**
 * Whether someone has the model live, said with a toast when they do (before an action that needs
 * it free, like converting it). Finish this user's own edit first (`stopIn`).
 */
export function modelHeldNotice(engine: CanvasEngine<object>, id: string): boolean {
  if (engine.service(MODEL_EDIT_LOCKS).holderOf(id) === null) return false;
  toast({ title: t("edit.busy"), description: t("edit.busyHint") });
  return true;
}
