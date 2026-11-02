import { onBackButtonPress } from "@tauri-apps/api/app";
import { invoke, isTauri } from "@tauri-apps/api/core";

import { isAndroidPlatform } from "@shared/core";

/**
 * Takes Android's back button, which otherwise walks the webview's history (through the files
 * opened, then out). Returns an unsubscribe function. Does nothing elsewhere.
 */
export function onBackButton(handler: () => void): () => void {
  if (!isTauri() || !isAndroidPlatform()) return () => {};
  const listener = onBackButtonPress(handler);
  return () => void listener.then((registered) => registered.unregister());
}

/** Closes the app, as Android's back button does on an app's first screen. */
export function leaveApp(): Promise<void> {
  return invoke("leave_app");
}
