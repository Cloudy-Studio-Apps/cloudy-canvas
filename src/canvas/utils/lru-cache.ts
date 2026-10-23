/**
 * A cache that keeps the `capacity` most recently used entries (a `Map` keeps insertion order:
 * reading an entry moves it to the end, and the oldest are dropped first).
 */
export class LruCache<K, V> {
  private readonly entries = new Map<K, V>();

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    const value = this.entries.get(key);
    if (value === undefined) return undefined;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, value);
    if (this.entries.size <= this.capacity) return;
    const oldest = this.entries.keys().next();
    if (!oldest.done) this.entries.delete(oldest.value);
  }

  /** The cached value, or `make()`'s (cached). */
  getOrSet(key: K, make: () => V): V {
    const known = this.get(key);
    if (known !== undefined) return known;
    const value = make();
    this.set(key, value);
    return value;
  }
}
