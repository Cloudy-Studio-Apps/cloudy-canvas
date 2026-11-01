import { isTauri } from "@tauri-apps/api/core";

import { isBrowserReservedKey, isTypingTarget, isWindowsPlatform } from "@shared/core";

/**
 * Keeps the webview's own behavior out of a release: its right-click menu outside text fields and,
 * on Windows, the keys WebView2 acts on by itself. See `app/README.md`.
 */
export function installBrowserGuard(): void {
  if (!isTauri() || !import.meta.env.PROD) return;
  window.addEventListener("contextmenu", (event) => {
    if (!isTypingTarget(event.target)) event.preventDefault();
  });
  if (!isWindowsPlatform()) return;
  window.addEventListener(
    "keydown",
    (event) => {
      if (isBrowserReservedKey(event)) event.preventDefault();
    },
    { capture: true },
  );
}
