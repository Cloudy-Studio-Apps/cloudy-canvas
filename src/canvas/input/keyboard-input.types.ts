import type { Keymap } from "./keymap";
import type { PointerInput } from "./pointer-input";

export interface KeyboardInputHost {
  readonly pointer: PointerInput;
  readonly keymap: Keymap;
  isEditingText(): boolean;
  /** Returns `false` when the command had nothing to do. */
  runCommand(command: string): boolean | void;
}
