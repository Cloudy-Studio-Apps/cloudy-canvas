/** What the import couldn't bring over as it was, counted per kind of loss. */
export class ImportWarnings {
  private readonly counts = new Map<string, number>();

  add(message: string): void {
    this.counts.set(message, (this.counts.get(message) ?? 0) + 1);
  }

  /** One line per loss, e.g. "3 × gradients became their first color". */
  list(): string[] {
    return [...this.counts].map(([message, count]) => `${count} × ${message}`);
  }
}
