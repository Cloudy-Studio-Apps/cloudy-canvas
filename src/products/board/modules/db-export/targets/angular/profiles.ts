import type { CodeProfile } from "../code-target.types";

/**
 * Angular's versions, newest first. `modelSuffix`: files are named `<name>.model.ts` and
 * `<name>.enum.ts`, the convention model folders keep.
 */
export const ANGULAR_PROFILES: readonly CodeProfile[] = [
  { id: "22", label: "Angular 22", flags: { modelSuffix: true } },
  { id: "21", label: "Angular 21", flags: { modelSuffix: true } },
  { id: "20", label: "Angular 20", flags: { modelSuffix: true } },
];
