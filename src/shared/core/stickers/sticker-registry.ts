import { BUILT_IN_STICKER_GROUPS, EMOJI_GROUPS } from "./catalog";
import type { StickerDef, StickerGroup, StickerSection, StickerTab } from "./catalog";
import type { RegisteredGroup, RegisteredSet } from "./sticker-registry.types";

/**
 * Every sticker the app offers, in both products: the built-in groups, the emojis (loaded on first
 * use) and what plugins register (`api.stickers`). It's app-level, not per product, so a plugin's
 * stickers show in the board's and the design's pickers alike. Groups are listed by `order`; a
 * group's stickers are the built-in ones, then each set added to it, in order.
 */
export class StickerRegistry {
  private readonly groups = new Map<string, RegisteredGroup>();
  private readonly sets: RegisteredSet[] = [];
  private emojis: ReadonlyMap<string, readonly StickerDef[]> | null = null;
  private emojisPending: Promise<void> | null = null;
  private readonly listeners = new Set<() => void>();
  private version = 0;

  constructor() {
    for (const { stickers, ...group } of BUILT_IN_STICKER_GROUPS) {
      this.registerGroup(group);
      this.registerSet(group.id, stickers);
    }
    for (const { id, label, order, tab } of EMOJI_GROUPS) {
      this.registerGroup({ id, label, order, tab });
    }
  }

  /** Adds a group. Ids are unique: registering one that exists throws. */
  registerGroup(group: StickerGroup, owner?: string): void {
    const taken = this.groups.get(group.id);
    if (taken) {
      throw new Error(`The sticker group "${group.id}" exists already${ownerNote(taken.owner)}.`);
    }
    this.groups.set(group.id, { group: { ...group }, owner });
    this.changed();
  }

  /** Adds stickers to a group (a built-in one or one registered before). Ids are unique. */
  registerSet(groupId: string, stickers: readonly StickerDef[], owner?: string): void {
    if (!this.groups.has(groupId)) throw new Error(`No sticker group "${groupId}".`);
    for (const sticker of stickers) {
      if (this.get(sticker.id) || stickers.filter((s) => s.id === sticker.id).length > 1) {
        throw new Error(`The sticker "${sticker.id}" exists already.`);
      }
    }
    this.sets.push({ groupId, stickers: [...stickers], owner });
    this.changed();
  }

  /** Removes what `owner` registered (a plugin that failed). */
  drop(owner: string): void {
    for (const [id, entry] of this.groups) if (entry.owner === owner) this.groups.delete(id);
    for (let i = this.sets.length - 1; i >= 0; i--) {
      const set = this.sets[i];
      if (set && (set.owner === owner || !this.groups.has(set.groupId))) this.sets.splice(i, 1);
    }
    this.changed();
  }

  /** The groups of a tab with their stickers, by order. Emoji groups are empty until loaded. */
  sections(tab: StickerTab): StickerSection[] {
    return [...this.groups.values()]
      .map(({ group }) => group)
      .filter((group) => (group.tab ?? "stickers") === tab)
      .sort((a, b) => a.order - b.order)
      .map((group) => ({
        id: group.id,
        label: group.label,
        description: group.description,
        stickers: this.stickersOf(group.id),
      }));
  }

  /** A sticker by id among what's loaded (emojis only once `loadEmojis` is done). */
  get(id: string): StickerDef | undefined {
    for (const set of this.sets) {
      const found = set.stickers.find((sticker) => sticker.id === id);
      if (found) return found;
    }
    for (const stickers of this.emojis?.values() ?? []) {
      const found = stickers.find((sticker) => sticker.id === id);
      if (found) return found;
    }
    return undefined;
  }

  /** A sticker by id, loading the emojis first when it's one. */
  async find(id: string): Promise<StickerDef | undefined> {
    if (id.startsWith("emoji:")) await this.loadEmojis();
    return this.get(id);
  }

  /** Whether the emoji catalog is loaded. */
  emojisLoaded(): boolean {
    return this.emojis !== null;
  }

  /** Loads the emoji catalog (its own chunk) once. */
  loadEmojis(): Promise<void> {
    this.emojisPending ??= import("./catalog/emoji").then(
      ({ EMOJI_SECTIONS }) => {
        this.emojis = new Map(EMOJI_SECTIONS.map((section) => [section.id, section.stickers]));
        this.changed();
      },
      (error: unknown) => {
        this.emojisPending = null;
        throw error;
      },
    );
    return this.emojisPending;
  }

  /** Calls `listener` whenever groups or stickers change (for `useSyncExternalStore`). */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Bumped on every change. */
  getVersion(): number {
    return this.version;
  }

  private stickersOf(groupId: string): StickerDef[] {
    const own = this.emojis?.get(groupId) ?? [];
    const added = this.sets.filter((set) => set.groupId === groupId).flatMap((s) => s.stickers);
    return [...own, ...added];
  }

  private changed(): void {
    this.version++;
    for (const listener of this.listeners) listener();
  }
}

function ownerNote(owner: string | undefined): string {
  return owner ? ` (the plugin "${owner}" added it)` : "";
}

/** The app's stickers (see `StickerRegistry`). */
export const stickerCatalog = new StickerRegistry();
