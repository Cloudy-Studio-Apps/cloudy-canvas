# App stores

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Toasts

- **Toasts:** report failures with `notifyError(title, error)` or `toast({...})` (`shared/stores/toast-store.ts`), never only `console.error`. The `<Toaster />` is mounted in the providers.
