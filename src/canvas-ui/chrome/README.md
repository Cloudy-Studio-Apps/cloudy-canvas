# Hide UI

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Hide UI

- **Hide UI** (Ctrl+\\, Figma's): each product's core module contributes the `toggleUi` host command and `useHideUiCommand` (`canvas-ui/chrome/`, a session hook: toggles `useChromeStore`, `shared/stores/chrome-store.ts`, session only, shown again when the editor closes, with a toast naming the key); the chromes read `useUiHidden()` and leave only the canvas, the collaborators, the context menu and the overlays.
