import type { CodeWarning } from "../warnings.types";

/** The PHP class names of the exported tables and enums, collisions numbered. */
export interface LaravelNames {
  model(table: string): string;
  enumClass(name: string): string;
  warnings: CodeWarning[];
}
