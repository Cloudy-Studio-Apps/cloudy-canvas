import type { ChangelogGroup } from "@shared/core";

export interface ChangelogGroupsProps {
  groups: readonly ChangelogGroup[];
}

export interface ChangeTextProps {
  /** One change, where `code` spans are shown as code. */
  text: string;
}
