/** The set of selected shape ids. */
export class Selection {
  private current: ReadonlySet<string> = new Set();

  get ids(): ReadonlySet<string> {
    return this.current;
  }

  get size(): number {
    return this.current.size;
  }

  has(id: string): boolean {
    return this.current.has(id);
  }

  /** The selected id when exactly one shape is selected. */
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
    return true;
  }

  /** Drops ids that no longer exist. Returns whether it changed. */
  remove(ids: ReadonlySet<string>): boolean {
    return this.set([...this.current].filter((id) => !ids.has(id)));
  }
}
