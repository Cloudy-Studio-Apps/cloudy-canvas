const keys = new WeakMap<object, number>();
let next = 1;

/**
 * A number that stays the same for one object and differs between objects: a cache key for
 * values worked out from an object that's replaced, not changed, when it changes (e.g. a stored
 * vector network).
 */
export function identityKey(value: object): number {
  let key = keys.get(value);
  if (key === undefined) {
    key = next++;
    keys.set(value, key);
  }
  return key;
}
