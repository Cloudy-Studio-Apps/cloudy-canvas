import { PLUGIN_API_VERSION } from "@shared/core";

/**
 * The object as a plugin sees it: reading a property it doesn't have throws, naming it (e.g.
 * `api.board.editor.toolbar`), instead of handing the plugin `undefined` to fail on later.
 * Nested objects are checked the same way.
 */
export function strictApi<T extends object>(value: T, path: string): T {
  return new Proxy(value, {
    get(target, key, receiver) {
      const found: unknown = Reflect.get(target, key, receiver);
      if (typeof key === "symbol" || key === "then" || key === "toJSON") return found;
      if (!(key in target)) {
        throw new Error(
          `${path}.${key} isn't part of the plugin API (version ${PLUGIN_API_VERSION}).`,
        );
      }
      return isPlainObject(found) ? strictApi(found, `${path}.${key}`) : found;
    },
  });
}

/**
 * Only the API's own groups are wrapped. Classes, functions, React and lists are handed out as
 * they are, and so is anything with an `id`: extension points must stay the same objects (the
 * host keys contributions by them), and a manifest may lack optional fields.
 */
function isPlainObject(value: unknown): value is object {
  if (typeof value !== "object" || value === null || "id" in value) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
