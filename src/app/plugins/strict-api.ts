import { PLUGIN_API_VERSION } from "@shared/core";

/**
 * The object as a plugin sees it: reading a property it doesn't have throws, naming it (e.g.
 * `api.board.palette`), instead of handing the plugin `undefined` to fail on later. Only this
 * object is checked, not what it holds: `createPluginApi` wraps the api and each of its groups,
 * so a plugin can still look up a key that may be missing in a value (`api.board.STICKY_COLORS`),
 * and points stay the same objects.
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
      return found;
    },
  });
}
