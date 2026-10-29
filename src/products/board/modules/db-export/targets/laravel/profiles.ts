import type { CodeProfile } from "../code-target.types";

/**
 * Laravel's versions, newest first. `castsMethod`: casts are a `casts()` method (Laravel 11+)
 * rather than a `$casts` property.
 */
export const LARAVEL_PROFILES: readonly CodeProfile[] = [
  { id: "13", label: "Laravel 13", flags: { castsMethod: true } },
  { id: "12", label: "Laravel 12", flags: { castsMethod: true } },
  { id: "11", label: "Laravel 11", flags: { castsMethod: true } },
];
