# Loading screen

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md)._

## Loading screen

- **Loading screen:** long tasks the whole window waits for run in `runWithLoading(title, (report) => …)` (`shared/stores/loading-store.ts`); `GlobalLoader` (mounted in the providers) shows `LoadingScreen` (`shared/ui/components/loading-screen/`: the hopping foca watona, `HoppingSeal` in `shared/ui/brand/`, the stage and a progress bar), which `CanvasLoadingOverlay` reuses.
