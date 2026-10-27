import type { DescribedError } from "./describe-error.types";

export interface ErrorDetailsProps {
  error: DescribedError;
  /** "Version 0.2.0 · Development", shown under the stack. */
  version: string;
}
