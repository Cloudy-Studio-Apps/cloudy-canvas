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

  /** Runs `start` for a source unless one already runs (then returns that one). */
  run(
    id: string,
    options: UpdateOptions,
    start: (options: UpdateOptions) => Promise<UpdateResult>,
  ): Promise<UpdateResult> {
    const running = this.running.get(id);
    if (running) return running;
    const run = start({
      signal: options.signal,
      onStage: (stage) => {
        this.stages.set(id, stage);
        this.emitter.emit();
        options.onStage?.(stage);
      },
    }).then((result) => {
      this.running.delete(id);
      this.stages.delete(id);
      if (result.ok) this.errors.delete(id);
      else this.errors.set(id, result.error ?? "");
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

  forget(id: string): void {
    this.errors.delete(id);
  }
}
