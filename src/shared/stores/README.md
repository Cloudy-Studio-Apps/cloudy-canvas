# App stores

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Toasts

- **Toasts:** report failures with `notifyError(title, error)` or `toast({...})` (`shared/stores/toast-store.ts`), never only `console.error`. The `<Toaster />` is mounted in the providers.

## Saved palettes

- **Saved palettes:** `usePaletteFavoritesStore` (`palette-favorites-store.ts`) keeps the palettes saved from the color wizard's gallery between sessions (`toggle` saves or removes one). They're the user's, not a file's.
- **Home:** `useHomeStore` (`home-store.ts`, `cloudy-canvas:home`) keeps Home's choices: the seals card hidden or not, and the recent files as a grid or a list.
- **Language:** `useLocaleStore` (`locale-store.ts`, `cloudy-canvas:locale`) keeps Settings › Language (`system`, `en` or `es`). `app/i18n-boot.ts` reads it once, before anything else runs, so a change applies on the next launch (see `shared/core/i18n/`).
