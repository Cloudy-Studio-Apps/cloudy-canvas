import type { ProjectRegistry } from "@shared/core";
import { TauriProjectRegistry } from "./tauri-project-registry";

/** The registry of projects on this platform. */
export const projectRegistry: ProjectRegistry = new TauriProjectRegistry();
