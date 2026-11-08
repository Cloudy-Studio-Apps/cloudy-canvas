import { defineService } from "../services";
import { Emitter } from "../utils";
import type { LocalLockHolder } from "./model-edit-locks.types";

/** The holder id of a lock this user holds. */
const SELF: LocalLockHolder = "self";

/**
 * Who has a 3D model live (being turned or textured): one person at a time. This user's own lock
 * and the others' (fed from presence) sit here, so edits can wait for whoever holds it.
 */
export class ModelEditLocks {
  private local: string | null = null;
  private remote: ReadonlyMap<string, string> = new Map();
  private readonly changes = new Emitter();

  /** A collaborator id, `"self"` for this user, or `null` when nobody holds the model. */
  holderOf(elementId: string): string | null {
    if (this.local === elementId) return SELF;
    return this.remote.get(elementId) ?? null;
  }

  /** The element this user has live (`null`: none). */
  localLock(): string | null {
    return this.local;
  }

  lockLocal(elementId: string | null): void {
    if (this.local === elementId) return;
    this.local = elementId;
    this.changes.emit();
  }

  /** Replaces the others' locks (element id to collaborator id). */
  setRemote(holders: ReadonlyMap<string, string>): void {
    if (sameHolders(this.remote, holders)) return;
    this.remote = new Map(holders);
    this.changes.emit();
  }

  onChange(listener: () => void): () => void {
    return this.changes.subscribe(listener);
  }

  /** Throws when someone else holds the model. */
  assertFree(elementId: string): void {
    const holder = this.holderOf(elementId);
    if (holder !== null && holder !== SELF) {
      throw new Error(
        "This model is being edited by someone else. Wait until they finish, then try again.",
      );
    }
  }
}

function sameHolders(a: ReadonlyMap<string, string>, b: ReadonlyMap<string, string>): boolean {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) if (b.get(key) !== value) return false;
  return true;
}

export const MODEL_EDIT_LOCKS = defineService("model3d.locks", () => new ModelEditLocks());
