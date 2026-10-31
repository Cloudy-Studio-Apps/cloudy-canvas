/** The `<defs>` of a document: reusable parts, with ids unique in it. */
export class SvgDefs {
  private readonly parts: string[] = [];
  private readonly shared = new Map<string, string>();
  private next = 1;

  /** A new id. */
  id(prefix: string): string {
    return `${prefix}${this.next++}`;
  }

  /** Adds a part (already holding its id). */
  add(markup: string): void {
    this.parts.push(markup);
  }

  /** The id of the part `key` names, which `make` writes (with that id) the first time. */
  once(key: string, prefix: string, make: (id: string) => string): string {
    let id = this.shared.get(key);
    if (!id) {
      id = this.id(prefix);
      this.shared.set(key, id);
      this.add(make(id));
    }
    return id;
  }

  toString(): string {
    return this.parts.length > 0 ? `<defs>${this.parts.join("")}</defs>` : "";
  }
}
