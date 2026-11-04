import { defineService, DocumentFeed, type CanvasDocument, type ElementPatch } from "@canvas";

import type { DataFormat, DataSourceType } from "../data.points.types";
import type { SettingValue } from "../source";
import {
  createDataSource,
  DATA_SOURCE_DEFAULTS,
  DATA_SOURCE_TYPE,
  isDataSource,
  type DataField,
  type DataSourceElement,
} from "../source";
import type { DataRow, DataTable } from "../table";
import {
  loadFilePaths,
  loadSourceSecrets,
  missingSecretKeys,
  readSnapshot,
  updateSource,
  type DataContext,
  type UpdateOptions,
  type UpdateResult,
  type UpdateStage,
} from "../update";
import type { DataSourceInit } from "./design-data-sources.types";
import { sourceName } from "./source-name";
import { sharedState } from "./shared-state";
import type { SharedState } from "./shared-state.types";
import type { SourceUpdates } from "./source-updates";
import { clearSecrets, writeSecrets } from "./write-secrets";

const NOT_READY = "Data sources aren't ready: no editor is open.";

/**
 * The design's data sources and the only place that makes, edits and updates them (one undo step
 * each). The editor gives it the registered types and formats and the platform (`setContext`);
 * the last failed Update's message and the running stage of each source stay in memory: they
 * belong to this device, not to the file.
 */
export class DesignDataSources {
  private readonly feed: DocumentFeed;
  private readonly shared: SharedState;

  constructor(private readonly doc: CanvasDocument) {
    this.shared = sharedState(doc);
    this.feed = new DocumentFeed(
      doc,
      (change) =>
        change.removed.size > 0 ||
        [...change.updated].some((id) => doc.field(id, "type") === DATA_SOURCE_TYPE),
    );
  }

  private get context(): DataContext | null {
    return this.shared.context;
  }

  private get updates(): SourceUpdates {
    return this.shared.updates;
  }

  /** Sets (or clears, with `null`) what Updates and secrets need from the open editor. */
  setContext(context: DataContext | null): void {
    this.shared.context = context;
  }

  /** Fires when a source's record changes and when an Update moves on, ends or fails. */
  onChange(listener: () => void): () => void {
    const offFeed = this.feed.subscribe(listener);
    const offLocal = this.updates.emitter.subscribe(listener);
    return () => {
      offFeed();
      offLocal();
    };
  }

  /** The source types and formats registered in the open editor (empty without one). */
  types(): DataSourceType[] {
    return this.context?.types ?? [];
  }

  formats(): DataFormat[] {
    return this.context?.formats ?? [];
  }

  /** Every source, in order. */
  list(): DataSourceElement[] {
    const records: DataSourceElement[] = [];
    for (const id of this.doc.ids()) {
      if (this.doc.field(id, "type") !== DATA_SOURCE_TYPE) continue;
      const el = this.doc.get(id);
      if (el && isDataSource(el)) records.push(el);
    }
    return records.sort((a, b) => (a.index < b.index ? -1 : a.index > b.index ? 1 : 0));
  }

  get(id: string): DataSourceElement | undefined {
    const el = this.doc.get(id);
    return el && isDataSource(el) ? el : undefined;
  }

  /** Adds a source in one undo step; its secrets go to this device, never to the file. */
  async create(init: DataSourceInit): Promise<DataSourceElement> {
    const { services, type } = this.ready(init.sourceType);
    const index = this.doc.nextIndex();
    const draft = createDataSource(index, {
      name: "",
      sourceType: init.sourceType,
      settings: {},
      format: init.format,
      formatOptions: init.formatOptions,
    });
    const settings = await writeSecrets(services, draft.id, type, init.settings, init.secrets);
    const taken = this.list().map((s) => s.name);
    const wanted = init.name?.trim() || type.defaultName(settings) || DATA_SOURCE_DEFAULTS.name;
    const record = { ...draft, settings, name: sourceName(wanted, taken) };
    this.doc.checkpoint();
    this.doc.add(record);
    return this.get(record.id) ?? record;
  }

  /** Renames a source to an identifier made from `name` (unique, not a reserved word). */
  rename(id: string, name: string): void {
    const source = this.require(id);
    if (!name.trim()) return;
    const taken = this.list().flatMap((s) => (s.id === id ? [] : [s.name]));
    const next = sourceName(name, taken);
    if (next !== source.name) this.patch(id, { name: next });
  }

  /** Replaces a source's settings; secrets in them go to this device and stale ones are cleared. */
  async setSettings(
    id: string,
    values: Record<string, SettingValue>,
    secrets?: Record<string, string>,
  ): Promise<void> {
    const source = this.require(id);
    const { services, type } = this.ready(source.sourceType);
    const settings = await writeSecrets(services, id, type, values, secrets, source.settings);
    this.patch(id, { settings });
  }

  setFields(id: string, fields: DataField[]): void {
    this.require(id);
    this.patch(id, { fields });
  }

  /** Sets how the data is read: `"auto"` or a format id, with its options. */
  setFormat(id: string, format: string, options: Record<string, SettingValue> = {}): void {
    this.require(id);
    this.patch(id, { format, formatOptions: options });
  }

  /** Deletes a source and its secrets on this device (its snapshot asset stays, for undo). */
  async remove(id: string): Promise<void> {
    const source = this.require(id);
    const type = this.context?.types.find((t) => t.id === source.sourceType);
    if (this.context && type) {
      await clearSecrets(this.context.services, id, type.settings, source.settings);
    }
    this.doc.checkpoint();
    this.doc.remove([id]);
    this.updates.forget(id);
  }

  /** Fetches a source again into a new snapshot (one undo step); a failure changes nothing. */
  update(id: string, options: UpdateOptions = {}): Promise<UpdateResult> {
    const context = this.context;
    if (!context) throw new Error(NOT_READY);
    return this.updates.run(id, options, (opts) => updateSource(this.doc, id, context, opts));
  }

  /** Updates every source, one after another; the results are in list order. */
  async updateAll(options: UpdateOptions = {}): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];
    for (const source of this.list()) results.push(await this.update(source.id, options));
    return results;
  }

  /** The rows of a source's last snapshot. */
  rows(id: string): readonly DataRow[] {
    return readSnapshot(this.doc, this.get(id)?.snapshot ?? null);
  }

  table(id: string): DataTable {
    return { rows: this.rows(id), fields: this.get(id)?.fields ?? [] };
  }

  /**
   * The secrets a source needs that this device doesn't have (by `key` / `key.name`), also the
   * ones entered for another origin than the settings' now.
   */
  async missingSecrets(id: string): Promise<string[]> {
    const source = this.require(id);
    const { services, type } = this.ready(source.sourceType);
    const stored = await loadSourceSecrets(services, id, type, source.settings);
    return missingSecretKeys(type.settings, source.settings, stored);
  }

  /** The file settings whose file this device has no path for (pick it again here). */
  async missingFiles(id: string): Promise<string[]> {
    const source = this.require(id);
    const { services, type } = this.ready(source.sourceType);
    const paths = await loadFilePaths(services, id, type.settings, source.settings);
    return type.settings.flatMap((spec) =>
      spec.kind === "file" && source.settings[spec.key] && !paths[spec.key] ? [spec.key] : [],
    );
  }

  /** The last failed Update's message on this device, `null` once one succeeds. */
  error(id: string): string | null {
    return this.updates.error(id);
  }

  /** What a running Update of a source is doing, `null` when none is running. */
  stage(id: string): UpdateStage | null {
    return this.updates.stage(id);
  }

  private ready(sourceType: string): DataContext & { type: DataSourceType } {
    if (!this.context) throw new Error(NOT_READY);
    const type = this.context.types.find((t) => t.id === sourceType);
    if (!type) throw new Error(`Unknown source type "${sourceType}".`);
    return { ...this.context, type };
  }

  private require(id: string): DataSourceElement {
    const source = this.get(id);
    if (!source) throw new Error(`There's no data source with the id "${id}".`);
    return source;
  }

  /** One undo step. */
  private patch(id: string, patch: ElementPatch<DataSourceElement>): void {
    this.doc.checkpoint();
    this.doc.update(id, patch);
  }
}

/** The design's data sources (`engine.service(DESIGN_DATA_SOURCES)`, `useService` in React). */
export const DESIGN_DATA_SOURCES = defineService(
  "design.dataSources",
  (doc) => new DesignDataSources(doc),
);
