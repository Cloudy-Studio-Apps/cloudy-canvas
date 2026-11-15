import { Store } from "../../utils";
import type {
  VariantChoices,
  VariantChoicesOptions,
  VariantChoicesSnapshot,
  VariantPick,
} from "./variant-choices.types";
import { variantNote } from "./variant-note";

/** How long `variants_choose` waits for the user: under the transport's 30 s reply timeout. */
export const VARIANT_WAIT_MS = 25_000;

/** What a waiting agent is told, by `variants_choose` and by every call refused meanwhile. */
export const VARIANTS_WAIT_MESSAGE =
  "The user hasn't chosen yet. End your turn now and wait for them: they will tell you to go on. Until they choose, your other tool calls are refused.";

/** The pending choices of the app's tabs (see `VariantChoices`). */
export function createVariantChoices(options: VariantChoicesOptions = {}): VariantChoices {
  const waitMs = options.waitMs ?? VARIANT_WAIT_MS;
  const store = new Store<VariantChoicesSnapshot>({ byTab: {} });
  /** The running wait of each tab, until it ends or the pick arrives. */
  const waits = new Map<string, (pick: VariantPick | null) => void>();
  const lastPicks = new Map<string, VariantPick>();
  const notes = new Map<string, string>();

  const requestOf = (session: string) =>
    Object.values(store.get().byTab).find((request) => request.session === session) ?? null;
  const remove = (tabId: string) => {
    const byTab = { ...store.get().byTab };
    delete byTab[tabId];
    store.set({ byTab });
  };
  const resolve = (tabId: string, pick: VariantPick) => {
    const request = store.get().byTab[tabId];
    if (!request) return;
    remove(tabId);
    lastPicks.set(request.session, pick);
    const wait = waits.get(tabId);
    waits.delete(tabId);
    // Delivered as the call's answer, or (after the wait) as a note on the agent's next call.
    if (wait) wait(pick);
    else notes.set(request.session, variantNote(pick));
  };

  return {
    store,
    open(request) {
      const taken = store.get().byTab[request.tabId];
      if (taken) {
        throw new Error(
          taken.session === request.session
            ? "You are already waiting for the user's pick: end your turn."
            : "Another agent is waiting for the user's pick in this tab.",
        );
      }
      if (requestOf(request.session)) {
        throw new Error("You are already waiting for the user's pick: end your turn.");
      }
      lastPicks.delete(request.session);
      notes.delete(request.session);
      store.set({ byTab: { ...store.get().byTab, [request.tabId]: request } });
      return new Promise<VariantPick | null>((done) => {
        const timer = setTimeout(() => {
          waits.delete(request.tabId);
          done(null);
        }, waitMs);
        waits.set(request.tabId, (pick) => {
          clearTimeout(timer);
          done(pick);
        });
      });
    },
    pending: (tabId) => store.get().byTab[tabId] ?? null,
    resolve,
    isLocked: (session) => requestOf(session) !== null,
    last(session) {
      if (requestOf(session)) return "pending";
      return lastPicks.get(session) ?? null;
    },
    takeNote(session) {
      const note = notes.get(session) ?? null;
      notes.delete(session);
      return note;
    },
    dropTab: (tabId) => resolve(tabId, { choice: "dismissed" }),
    dropSession(session) {
      const request = requestOf(session);
      if (request) {
        remove(request.tabId);
        const wait = waits.get(request.tabId);
        waits.delete(request.tabId);
        wait?.({ choice: "dismissed" });
      }
      lastPicks.delete(session);
      notes.delete(session);
    },
  };
}
