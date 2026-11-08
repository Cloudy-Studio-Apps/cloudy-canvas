import type { ReactNode } from "react";

import type { LibraryEntry } from "@shared/core";

/** The file's project libraries for its libraries menu (`useFileLibraries`). */
export interface FileLibraries {
  /** The project's libraries are open (switches work only then). */
  ready: boolean;
  projectName: string;
  /** The project's libraries, in its order. */
  entries: LibraryEntry[];
  /** The ones the file uses. */
  used: ReadonlySet<string>;
  /** The ones whose file can't be read now. */
  unreadable: ReadonlySet<string>;
  /** How many layers use a library's variables and styles. */
  users: (libraryId: string) => number;
  /** Turns a library on or off for the file. */
  setUsed: (libraryId: string, on: boolean) => void;
}

/** A library the right-click menu can move items to. */
export interface MoveTarget {
  id: string;
  label: string;
  select: () => void;
}

/** `useMoveToLibrary`'s menu items and the confirmation to render. */
export interface MoveToLibrary {
  targets: MoveTarget[];
  dialog: ReactNode;
}

export interface MoveToLibraryMenuProps {
  /** The file's own variables, collections or styles it moves. */
  ids: readonly string[];
  /** What is right-clicked. */
  children: ReactNode;
}
