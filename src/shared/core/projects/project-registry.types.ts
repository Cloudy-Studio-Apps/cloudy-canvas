export interface ProjectRecord {
  id: string;
  name: string;
  /** Absolute path of the project folder. */
  root: string;
  color: string;
  pinned: boolean;
  /** ISO 8601 timestamp */
  openedAt: string;
}

/** The projects this device knows about. */
export interface ProjectRegistry {
  list(): Promise<ProjectRecord[]>;
  get(id: string): Promise<ProjectRecord | null>;
  put(record: ProjectRecord): Promise<void>;
  remove(id: string): Promise<void>;
}
