/**
 * An open, runtime list of items keyed by a string id. Built-ins are registered at startup and
 * plugins can add more later; code that uses it never assumes which keys exist.
 */
export class Registry<T> {
  private readonly items = new Map<string, T>();

  constructor(
    /** What the items are, for error messages (e.g. "element kind"). */
    private readonly name: string,
    private readonly keyOf: (item: T) => string,
  ) {}

  /** Adds an item. Throws if its key is already taken, so two plugins can't silently collide. */
  register(item: T): void {
    const key = this.keyOf(item);
    if (this.items.has(key)) throw new Error(`A ${this.name} "${key}" is already registered.`);
    this.items.set(key, item);
  }

  get(key: string): T | undefined {
    return this.items.get(key);
  }

  has(key: string): boolean {
    return this.items.has(key);
  }

  /** Every item, in registration order. */
  all(): T[] {
    return [...this.items.values()];
  }

  keys(): string[] {
    return [...this.items.keys()];
  }
}
