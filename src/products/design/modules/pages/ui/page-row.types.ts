import type { PageElement } from "@design";

export interface PageRowProps {
  page: PageElement;
  /** Its position in the page order. */
  position: number;
  current: boolean;
  /** Whether it can be deleted (it isn't the only page). */
  deletable: boolean;
  /** A page row was dropped on this one: the dragged page goes to `position`. */
  onDropPage(id: string, position: number): void;
}

export interface PageMenuProps {
  page: PageElement;
  deletable: boolean;
  onRename(): void;
}
