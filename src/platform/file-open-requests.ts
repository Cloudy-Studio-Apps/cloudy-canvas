import type { FileOpenRequests } from "@shared/core";
import { TauriFileOpenRequests } from "./tauri-file-open-requests";

/** Files the OS or a drop asks the app to open. Does nothing outside the desktop app. */
export const fileOpenRequests: FileOpenRequests = new TauriFileOpenRequests();
