/** A key combination. `mod` is Ctrl on Windows/Linux and Cmd on macOS. */
export interface Shortcut {
  /** `KeyboardEvent.key`, compared case-insensitively. */
  key?: string;
  /** `KeyboardEvent.code`, for layout-independent keys like `Digit1`. */
  code?: string;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  /** Label shown in the UI when it differs from the key itself. */
  label?: string;
}
