import type { CanvasDocument } from "../document";
import type { FileTab } from "./file-tabs.types";
import type { TabLoadsHost } from "./tab-loads.types";

/**
 * Loads and drops a `FileTabs`' documents: one load per tab at a time, its result in the tab's
 * `load`. A tab hibernated or closed while loading drops its entry, and the load then destroys
 * the document it made.
 */
export class TabLoads {
  private readonly host: TabLoadsHost;
  /** Loads in flight; a tab hibernated or closed meanwhile drops its entry, and the load its document. */
  private readonly loads = new Map<string, Promise<CanvasDocument>>();

  constructor(host: TabLoadsHost) {
    this.host = host;
  }

  /** The tab's document, loading it once; concurrent calls share one load. */
  ensure(id: string): Promise<CanvasDocument> {
    const tab = this.host.get(id);
    const source = this.host.source(id);
    if (!tab || !source) return Promise.reject(new Error(`No file tab ${id}`));
    if (tab.load.status === "ready") return Promise.resolve(tab.load.document);
    const pending = this.loads.get(id);
    if (pending) return pending;
    const load = this.host.loaders[tab.type]
      .load(source.fileId, tab.live)
      .then(({ document, info }) => {
        if (this.loads.get(id) !== load) {
          document.destroy();
          throw new Error(`File tab ${id} was closed or hibernated while loading`);
        }
        this.loads.delete(id);
        const name = info?.name ?? this.host.get(id)?.name ?? "";
        // A tab holding its document is at least `document`.
        this.host.patch(id, (current) => ({
          name,
          load: { status: "ready", document, info },
          ...(current.state === "hibernated" && { state: "document" as const }),
        }));
        return document;
      })
      .catch((error: unknown) => {
        if (this.loads.get(id) === load) {
          this.loads.delete(id);
          const message = error instanceof Error ? error.message : String(error);
          this.host.patch(id, () => ({ load: { status: "error", message } }));
        }
        throw error;
      });
    this.loads.set(id, load);
    this.host.patch(id, () => ({ load: { status: "loading" } }));
    return load;
  }

  /** Starts a load nobody awaits; a failure is in the tab's `load`. */
  quietly(id: string): void {
    this.ensure(id).catch(() => undefined);
  }

  /** Drops the tab's document (destroyed, or destroyed when its load ends) and sets it idle. */
  unload(tab: FileTab): void {
    this.loads.delete(tab.id);
    if (tab.load.status === "ready") tab.load.document.destroy();
    if (tab.load.status !== "idle") this.host.patch(tab.id, () => ({ load: { status: "idle" } }));
  }
}
