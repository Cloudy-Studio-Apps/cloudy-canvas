/**
 * A place features plug into (the toolbar, the canvas's element kinds, the agent tools, …), as a
 * typed token. The code that reads a point defines and exports it; modules contribute to it.
 * `T` is what's contributed.
 */
export interface ExtensionPoint<T> {
  /** Unique, e.g. `"board.toolbar"`; used in error messages. */
  readonly id: string;
  /**
   * Key of an item. Keyed points take one item per key (a second one throws, so two modules can't
   * silently collide); the others are plain ordered lists.
   */
  readonly keyOf?: (item: T) => string;
}

export interface ExtensionPointOptions<T> {
  keyOf?: (item: T) => string;
}

/** What a module's `register` contributes through; read by the code that owns each point. */
export interface ModuleHost {
  /** Adds items to a point. Only allowed while the modules register. */
  contribute<T>(point: ExtensionPoint<T>, ...items: NoInfer<T>[]): void;
  /** Everything contributed to the point, in module order (then contribution order). */
  get<T>(point: ExtensionPoint<T>): readonly T[];
  /** The item with this key on a keyed point. */
  find<T>(point: ExtensionPoint<T>, key: string): T | undefined;
  /** The id of the module that contributed the item with this key on a keyed point. */
  ownerOf<T>(point: ExtensionPoint<T>, key: string): string | undefined;
  /** Whether a module with this id is loaded. */
  has(moduleId: string): boolean;
  /**
   * The `exports` of a module this one `requires` or `uses`, or of any core module (the same object
   * on every call). Only while registering; throws for a module that isn't listed (nor core) or
   * exports nothing.
   */
  require<T extends object = ModuleExports>(moduleId: string): T;
}

/** What a module hands to the modules that require it. */
export type ModuleExports = Readonly<Record<string, unknown>>;

/**
 * A feature (sticky notes, the database schema, a plugin, …): one folder whose `<name>.module.ts`
 * plugs it into every point it needs.
 */
export interface AppModule {
  /** Unique, e.g. `"sticky"`. */
  readonly id: string;
  /**
   * Its tier (`docs/modules.md#tiers`): built-in modules say `"core"` or `"feature"`; plugins'
   * modules leave it unset. Only `scripts/check-modules.mjs` reads it.
   */
  readonly tier?: "core" | "feature";
  /** Modules that must be loaded; this one registers after them. */
  readonly requires?: readonly string[];
  /**
   * Modules that must be loaded, in any order: this one uses their code but not their
   * registrations (e.g. when `requires` would make a loop with another module's `after`).
   */
  readonly uses?: readonly string[];
  /** Modules this one registers after when they're loaded (e.g. to chain hooks in order). */
  readonly after?: readonly string[];
  /**
   * Its public API, for modules that require it (`host.require`): built-in modules hand their
   * `index.ts` and `ui/index.ts`, `{ ...frame, ...frameUi }`.
   */
  readonly exports?: ModuleExports;
  register(host: ModuleHost): void;
}

/** How `createModuleHost` treats modules that may fail without stopping the others (plugins). */
export interface ModuleLoadOptions {
  /**
   * Modules that are left out when they fail (their `register` throws, a module they require is
   * missing or left out, they collide with another module or depend on themselves in a loop).
   * The others still throw.
   */
  isOptional?: (module: AppModule) => boolean;
  /** Told about each optional module that was left out, and why. */
  onError?: (module: AppModule, error: Error) => void;
}
