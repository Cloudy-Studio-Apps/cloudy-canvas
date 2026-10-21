import type { CommandId } from "../commands.types";
import type { PointerInput } from "./pointer-input";

export interface KeyboardInputHost {
  readonly pointer: PointerInput;
  isEditingText(): boolean;
  /** Returns `false` when the command had nothing to do. */
  runCommand(command: CommandId): boolean | void;
}
