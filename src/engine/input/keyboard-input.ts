import { isInteractiveTarget, isTypingTarget } from "@core";

import type { Disposables } from "../utils";
import { commandForEvent } from "./keymap";
import type { KeyboardInputHost } from "./keyboard-input.types";

/** Window-level shortcuts (see KEYMAP) plus Space-to-pan. Ignored while typing in any field. */
export function bindKeyboard(disposables: Disposables, host: KeyboardInputHost): void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || isTypingTarget(event.target) || host.isEditingText()) return;

    if (event.key === " ") {
      if (isInteractiveTarget(event.target)) return;
      event.preventDefault();
      host.pointer.holdSpace();
      return;
    }

    const command = commandForEvent(event);
    if (command && host.runCommand(command) !== false) event.preventDefault();
  };

  disposables.listen(window, "keydown", handleKeyDown);
  disposables.listen(window, "keyup", (event) => {
    if (event.key === " ") host.pointer.releaseSpace();
  });
  disposables.listen(window, "blur", () => host.pointer.releaseSpace());
}
