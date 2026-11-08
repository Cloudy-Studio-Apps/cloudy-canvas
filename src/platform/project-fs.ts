import type { ProjectFs } from "@shared/core";
import { TauriProjectFs } from "./tauri-project-fs";

/** Disk access for projects on this platform. */
export const projectFs: ProjectFs = new TauriProjectFs();
