import { defineService, DocumentFeed, type CanvasDocument, type ElementPatch } from "@canvas";

// Leaves of `repeat/`, as `bindings/` imports `model/` leaves: no index cycles.
import { iteratorNames } from "../repeat/iterator-names";
import { renameReferences } from "../repeat/rename-references";
import type { DataFormat, DataSourceType } from "../data.points.types";
import type { SettingValue } from "../source";
import {
  createDataSource,
  DATA_SOURCE_DEFAULTS,
  dataSourcesIn,
  DATA_SOURCE_TYPE,
  isDataSource,
  type DataField,
  type DataSourceElement,
} from "../source";
import type { DataRow, DataTable } from "../table";
import {
  heldSnapshots,
  previewSource,
  readSnapshot,
  readSnapshotRows,
  updateSource,
  type DataContext,
  type PreviewInput,
  type PreviewResult,
  type ImageFailure,
  type UpdateOptions,
  type UpdateResult,
  type UpdateStage,
} from "../update";
import type { DataSourceInit, ShapeChange } from "./design-data-sources.types";
import { sourceName } from "./source-name";
import { sharedState } from "./shared-state";
import type { DataPhase, SharedState } from "./shared-state.types";
import type { SourceUpdates } from "./source-updates";
import type { UpdateProgress } from "./source-updates.types";
import { missingFiles, missingSecrets } from "./missing-device-state";
import { clearSecrets, writeSecrets } from "./write-secrets";
import { setShape } from "./set-shape";

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
  /** Each source's last shape change, so the next waits for it (`setShape`). */
  private readonly shaping = new Map<string, Promise<void>>();

  constructor(private readonly doc: CanvasDocument) {
    this.shared = sharedState(doc);
    // The snapshots the sources point at now stay through saves while it's open (undo).
    heldSnapshots(doc);
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

  /**
   * What repeats make: `"design"` (the default), their design caps of copies; `"export"`, every
   * row (`repeatRows` in the sync). Per document, in memory: an export sets it on its scratch copy.
   */
  phase(): DataPhase {
    return this.shared.phase;
  }

  setPhase(phase: DataPhase): void {
    this.shared.phase = phase;
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
    return dataSourcesIn(this.doc);
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
      rowsPath: init.rowsPath,
    });
    const settings = await writeSecrets(services, draft.id, type, init.settings, init.secrets);
    // A row name (`as`) would hide the source inside its iterator.
    const taken = [...this.list().map((s) => s.name), ...iteratorNames(this.doc)];
    const wanted = init.name?.trim() || type.defaultName(settings) || DATA_SOURCE_DEFAULTS.name;
    const record = { ...draft, settings, name: sourceName(wanted, taken) };
    this.doc.checkpoint();
    this.doc.add(record);
    return this.get(record.id) ?? record;
  }

  /**
   * Renames a source to an identifier made from `name` (unique, not a reserved word, nor an
   * iterator's row name).
   */
  rename(id: string, name: string): void {
    const source = this.require(id);
    if (!name.trim()) return;
    const taken = [
      ...this.list().flatMap((s) => (s.id === id ? [] : [s.name])),
      ...iteratorNames(this.doc),
    ];
    const next = sourceName(name, taken);
    if (next === source.name) return;
    // One undo step: the name and every reference to it change together, which is also why the
    // data sync sees a source change and unlinks nothing.
    this.doc.checkpoint();
    this.doc.batch(() => {
      const patch: ElementPatch<DataSourceElement> = { name: next };
      this.doc.update(id, patch);
      renameReferences(this.doc, source.name, next);
    });
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

  /** Sets where the rows are in the data (`null`: the first list found); an Update reads it. */
  setRowsPath(id: string, rowsPath: string | null): void {
    const source = this.require(id);
    if (source.rowsPath === rowsPath) return;
    this.patch(id, { rowsPath });
  }

  /**
   * Sets the step that renames and picks a source's fields once its rows are found (`null`
   * removes it), in one undo step and without fetching: the saved rows are shaped again and what
   * reads a renamed field follows it (`setShape`). Throws, writing nothing, for a shape that
   * would put two fields at one path or while the data isn't on this device. A source's changes
   * run one after another, and a function is given the shape the source has when its turn comes,
   * so quick edits each apply to the one before.
   */
  setShape(id: string, change: ShapeChange): Promise<void> {
    this.require(id);
    const run = () =>
      setShape(
        this.doc,
        id,
        typeof change === "function" ? change(this.require(id).shape ?? null) : change,
      );
    const next = (this.shaping.get(id) ?? Promise.resolve()).then(run, run);
    const settled = next.then(
      () => undefined,
      () => undefined,
    );
    this.shaping.set(id, settled);
    void settled.then(() => {
      if (this.shaping.get(id) === settled) this.shaping.delete(id);
    });
    return next;
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

  /**
   * Try it: runs settings not saved yet once and gives the rows they bring, writing nothing (see
   * `previewSource`).
   */
  preview(input: PreviewInput, signal: AbortSignal): Promise<PreviewResult> {
    const context = this.context;
    if (!context) throw new Error(NOT_READY);
    return previewSource(context, input, signal);
  }

  /** Updates every source, one after another; the results are in list order. */
  async updateAll(options: UpdateOptions = {}): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];
    for (const source of this.list()) results.push(await this.update(source.id, options));
    return results;
  }

  /** The rows of a source's last snapshot (none while its asset can't be read). */
  rows(id: string): readonly DataRow[] {
    return readSnapshot(this.doc, this.get(id)?.snapshot ?? null) ?? [];
  }

  /**
   * The rows of a source's last snapshot as read, before its shape step (the same as `rows`
   * without one; none while its asset can't be read).
   */
  rawRows(id: string): readonly DataRow[] {
    return readSnapshotRows(this.doc, this.get(id)?.snapshot ?? null)?.raw ?? [];
  }

  table(id: string): DataTable {
    return { rows: this.rows(id), fields: this.get(id)?.fields ?? [] };
  }

  /**
   * The secrets a source needs that this device doesn't have (by `key` / `key.name`), also the
   * ones entered for another origin than the settings' now.
   */
  missingSecrets(id: string): Promise<string[]> {
    const source = this.require(id);
    return missingSecrets(source, this.ready(source.sourceType));
  }

  /** The file and folder settings this device has no path for (pick them again here). */
  missingFiles(id: string): Promise<string[]> {
    const source = this.require(id);
    return missingFiles(source, this.ready(source.sourceType));
  }

  /** The last failed Update's message on this device, `null` once one succeeds. */
  error(id: string): string | null {
    return this.updates.error(id);
  }

  /** What a running Update of a source is doing, `null` when none is running. */
  stage(id: string): UpdateStage | null {
    return this.updates.stage(id);
  }

  /** How far a running Update's pictures are (`done` of `total`), `null` when none are saving. */
  progress(id: string): UpdateProgress | null {
    return this.updates.progress(id);
  }

  /**
   * The values whose picture the last good Update on this device couldn't save (a failed or
   * non-image download, a file not in the folder, or past the limit), in memory only.
   */
  imageFailures(id: string): string[] {
    return this.updates.imageFailures(id).failed.map((failure) => failure.value);
  }

  /** `imageFailures(id)` with why each one wasn't saved (`ImageFailure.reason`). */
  imageFailureDetails(id: string): ImageFailure[] {
    return this.updates.imageFailures(id).failed;
  }

  /** How many of `imageFailures(id)` were past the limit of new pictures one Update saves. */
  imagesOverLimit(id: string): number {
    return this.updates.imageFailures(id).overLimit;
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
