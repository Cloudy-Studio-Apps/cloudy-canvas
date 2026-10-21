/** The set of selected element ids, and the selected part of a single selected element. */
export class Selection {
  private current: ReadonlySet<string> = new Set();
  /**
   * A part of the single selected element (e.g. a table's row), picked with one of its handles.
   * Cleared whenever the selection changes.
   */
  part: string | null = null;
  private cached: { from: ReadonlySet<string>; list: readonly string[] } | null = null;

  /** The ids as an array that stays the same object until the selection changes. */
  list(): readonly string[] {
    if (this.cached?.from !== this.current) {
      this.cached = { from: this.current, list: [...this.current] };
    }
    return this.cached.list;
  }

  get ids(): ReadonlySet<string> {
    return this.current;
  }

  get size(): number {
    return this.current.size;
  }

  has(id: string): boolean {
    return this.current.has(id);
  }

  /** The selected id when exactly one element is selected. */
  single(): string | undefined {
    if (this.current.size !== 1) return undefined;
    const [id] = this.current;
    return id;
  }

  /** Replaces the selection. Returns whether it changed. */
  set(ids: Iterable<string>): boolean {
    const next = new Set(ids);
    if (next.size === this.current.size && [...next].every((id) => this.current.has(id))) {
      return false;
    }
    this.current = next;
    this.part = null;
    return true;
  }

  /** Drops ids that no longer exist. Returns whether it changed. */
  remove(ids: ReadonlySet<string>): boolean {
    return this.set([...this.current].filter((id) => !ids.has(id)));
  }
}
