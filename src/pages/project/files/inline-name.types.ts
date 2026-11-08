import type { ProjectEntry } from "@shared/core";

export interface InlineNameProps {
  entry: ProjectEntry;
  /** The text to show when it isn't being renamed. */
  label: string;
  /** Never turns into a field (the sidebar's rows: the field shows in the Files tab). */
  fixed?: boolean;
  className?: string;
}
