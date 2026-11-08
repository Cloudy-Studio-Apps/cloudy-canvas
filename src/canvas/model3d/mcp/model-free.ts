import { MODEL_EDIT_LOCKS } from "../model-edit-locks";
import type { ModelAgentWorkspace, ModelFileNoun } from "./model-agent.types";

/** Throws when the file is read-only or anyone (the user too) has the model live. */
export function assertModelFree(
  engine: ModelAgentWorkspace,
  id: string,
  noun: ModelFileNoun,
): void {
  if (engine.doc.isReadOnly) throw new Error(`This ${noun} is read-only.`);
  const holder = engine.service(MODEL_EDIT_LOCKS).holderOf(id);
  if (holder === null) return;
  const who = holder === "self" ? "the user" : "someone else";
  throw new Error(`This model is being edited by ${who}. Wait until they finish, then try again.`);
}
