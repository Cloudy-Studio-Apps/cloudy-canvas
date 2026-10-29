import type { CodeSchema } from "../model";
import type { CodeWarning } from "./warnings.types";

export type CodeLanguage = "php" | "ts" | "sql" | "prisma" | "js";

/** A generated file: its path inside the project, from the project's root. */
export interface CodeFile {
  path: string;
  content: string;
  language: CodeLanguage;
}

export type CodeOptionValue = string | boolean;

/** A choice a target offers (an ORM, a provider, DTOs on or off), drawn by the dialog. */
export type CodeOption =
  | {
      id: string;
      kind: "select";
      label: () => string;
      default: string;
      choices: { value: string; label: () => string }[];
    }
  | { id: string; kind: "switch"; label: () => string; default: boolean };

/** A version of a target. `flags` are what the target's generator reads to tell versions apart. */
export interface CodeProfile {
  /** e.g. `13`, `22`, `latest`. */
  id: string;
  /** e.g. "Laravel 13": a product name, not translated. */
  label: string;
  flags: Readonly<Record<string, string | number | boolean>>;
}

export interface CodeRequest {
  /** `single`: the one table's model; `project`: the framework's whole structure. */
  mode: "single" | "project";
  profile: CodeProfile;
  options: Readonly<Record<string, CodeOptionValue>>;
  /** Export time (Laravel migration names), passed in so the output is the same per call. */
  now: Date;
}

export interface CodeOutput {
  files: CodeFile[];
  warnings: CodeWarning[];
}

/**
 * A framework the schema exports to (`defineCodeTarget`), contributed to `boardCodeTargets`. It
 * reads only the neutral `CodeSchema` and returns the files; versions are its `profiles`.
 */
export interface CodeTargetDefinition {
  /** e.g. `laravel`, `postgres`. */
  id: string;
  /** e.g. "Laravel": a product name, not translated. */
  label: string;
  /** Newest first; the first is the default. */
  profiles: readonly CodeProfile[];
  options: readonly CodeOption[];
  generate(schema: CodeSchema, request: CodeRequest): CodeOutput;
}
