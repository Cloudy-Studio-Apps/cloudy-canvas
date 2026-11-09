import type { SaveChangesChoice } from "@canvas-ui/file/close-dialog";
import { Store } from "@canvas/utils/store";
import type { CloseTabPromptState, CloseTabQuestion } from "./close-tab-prompt.types";

/** The question `CloseTabPrompt` shows. */
export const closeTabPrompt = new Store<CloseTabPromptState>({ question: null });

/**
 * Asks what to do with a tab's changes nothing will save: resolves to `save` once `save` wrote
 * them (the dialog waits meanwhile), `discard`, or `cancel` (also when saving was cancelled or
 * failed, or another question replaced this one).
 */
export function askToCloseTab(
  name: string,
  save: () => Promise<boolean>,
): Promise<SaveChangesChoice> {
  closeTabPrompt.get().question?.choose("cancel");
  return new Promise((resolve) => {
    let busy = false;
    /** Clears the dialog unless another question replaced this one (`choose` is kept by copies). */
    const dismiss = () => {
      if (closeTabPrompt.get().question?.choose === question.choose) {
        closeTabPrompt.set({ question: null });
      }
    };
    const answer = (choice: SaveChangesChoice) => {
      dismiss();
      resolve(choice);
    };
    const question: CloseTabQuestion = {
      name,
      busy: false,
      choose(choice) {
        if (busy) return;
        if (choice !== "save") {
          answer(choice);
          return;
        }
        busy = true;
        closeTabPrompt.set({ question: { ...question, busy: true } });
        void save()
          .catch(() => false)
          .then((saved) => answer(saved ? "save" : "cancel"));
      },
    };
    closeTabPrompt.set({ question });
  });
}
