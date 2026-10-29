// `api.ui`: the app-level UI a plugin may use besides the barrels: notices, the loading overlay,
// the code editor, the brand seals, palette favorites and the kit (`api.ui.kit`).
export * as kit from "@shared/ui/kit";
export { CodeEditor } from "@shared/ui/components/code-editor";
export { CelebratingSeal } from "@shared/ui/brand/celebrating-seal";
export { SealLogo } from "@shared/ui/brand/seal-logo";
export { HoppingSeal } from "@shared/ui/brand/hopping-seal";
export { PaintingSeal } from "@shared/ui/brand/painting-seal";
export { PattingSeal } from "@shared/ui/brand/patting-seal";
export { notifyError, toast } from "@shared/stores/toast-store";
export { runWithLoading } from "@shared/stores/loading-store";
export { usePaletteFavoritesStore } from "@shared/stores/palette-favorites-store";
