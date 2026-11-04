import { Emitter } from "@canvas";

import type { UpdateOptions, UpdateResult, UpdateStage } from "../update";

/**
 * This device's Update state per source: the running Update (one at a time), its stage and the
 * last failure's message. In memory only, never in the file.
 */
export class SourceUpdates {
  readonly emitter = new Emitter();
  private readonly errors = new Map<string, string>();
  private readonly stages = new Map<string, UpdateStage>();
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
    }).then((result) => {
      // Forgotten meanwhile (the source was removed): record nothing.
      if (this.tokens.get(id) !== token) return result;
      this.tokens.delete(id);
      this.running.delete(id);
      this.stages.delete(id);
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

  /** Drops everything kept for a source (it was removed); a run still going records nothing. */
  forget(id: string): void {
    this.errors.delete(id);
    this.stages.delete(id);
    this.running.delete(id);
    this.tokens.delete(id);
  }
}
