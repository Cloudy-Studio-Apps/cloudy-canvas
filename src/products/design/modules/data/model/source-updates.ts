import { Emitter } from "@canvas";

import type { UpdateOptions, UpdateResult, UpdateStage } from "../update";
import type { ImageFailures, UpdateProgress } from "./source-updates.types";

const NO_FAILURES: ImageFailures = { failed: [], overLimit: 0 };
const NO_WARNINGS: string[] = [];

/**
 * This device's Update state per source: the running Update (one at a time), its stage and
 * progress, the last failure's message and the pictures the last good Update couldn't save and what its source type warned about. In
 * memory only, never in the file.
 */
export class SourceUpdates {
  readonly emitter = new Emitter();
  private readonly errors = new Map<string, string>();
  private readonly stages = new Map<string, UpdateStage>();
  private readonly progresses = new Map<string, UpdateProgress>();
  private readonly failures = new Map<string, ImageFailures>();
  private readonly warned = new Map<string, string[]>();
  private readonly running = new Map<string, Promise<UpdateResult>>();
  /** The run each source's state belongs to; gone once the source is forgotten. */
  private readonly tokens = new Map<string, object>();

  /** Runs `start` for a source unless one already runs (then returns that one). */
  run(
    id: string,
    options: UpdateOptions,
    start: (options: UpdateOptions) => Promise<UpdateResult>,
  ): Promise<UpdateResult> {
    const running = this.running.get(id);
    if (running) return running;
    // Made before `start`, so a stage reported at once already knows its run.
    const token = {};
    this.tokens.set(id, token);
    const run = start({
      signal: options.signal,
      onStage: (stage) => {
        if (this.tokens.get(id) !== token) return;
        this.stages.set(id, stage);
        this.emitter.emit();
        options.onStage?.(stage);
      },
      onProgress: (done, total) => {
        if (this.tokens.get(id) !== token) return;
        this.progresses.set(id, { done, total });
        this.emitter.emit();
        options.onProgress?.(done, total);
      },
      onWarnings: (warnings) => {
        if (this.tokens.get(id) !== token) return;
        if (warnings.length > 0) this.warned.set(id, warnings);
        else this.warned.delete(id);
        options.onWarnings?.(warnings);
      },
      onImageFailures: (failed, overLimit) => {
        if (this.tokens.get(id) !== token) return;
        this.failures.set(id, { failed, overLimit });
        options.onImageFailures?.(failed, overLimit);
      },
    }).then((result) => {
      // Forgotten meanwhile (the source was removed): record nothing.
      if (this.tokens.get(id) !== token) return result;
      this.tokens.delete(id);
      this.running.delete(id);
      this.stages.delete(id);
      this.progresses.delete(id);
      if (result.ok) this.errors.delete(id);
      else if (!result.aborted) this.errors.set(id, result.error ?? "");
      this.emitter.emit();
      return result;
    });
    this.running.set(id, run);
    return run;
  }

  error(id: string): string | null {
    return this.errors.get(id) ?? null;
  }

  stage(id: string): UpdateStage | null {
    return this.stages.get(id) ?? null;
  }

  /** How far the running Update's pictures are, `null` when it isn't saving any. */
  progress(id: string): UpdateProgress | null {
    return this.progresses.get(id) ?? null;
  }

  /** The pictures the last good Update couldn't save (none before one). */
  imageFailures(id: string): ImageFailures {
    return this.failures.get(id) ?? NO_FAILURES;
  }

  /** What the last good Update's source type said about the fetch (none before one). */
  warnings(id: string): string[] {
    return this.warned.get(id) ?? NO_WARNINGS;
  }

  /** Drops everything kept for a source (it was removed); a run still going records nothing. */
  forget(id: string): void {
    this.errors.delete(id);
    this.stages.delete(id);
    this.progresses.delete(id);
    this.failures.delete(id);
    this.warned.delete(id);
    this.running.delete(id);
    this.tokens.delete(id);
  }
}
