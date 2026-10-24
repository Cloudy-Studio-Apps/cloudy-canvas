import { useChromeStore } from "@shared/stores/chrome-store";

/** Whether the editor's UI is hidden (`toggleUi`), so the chrome leaves only the canvas. */
export function useUiHidden(): boolean {
  return useChromeStore((state) => state.hidden);
}
