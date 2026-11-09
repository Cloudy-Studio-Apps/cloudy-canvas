import { delay } from "./utils";

/**
 * Work that must land in the document before its last save (a live edit that writes when it
 * finishes), keyed so setting it again replaces it. `run` awaits them one after another, for at
 * most `timeoutMs`, so a closing save never waits forever.
 */
export class BeforeSaveTasks {
  private readonly tasks = new Map<string, () => Promise<void>>();

  set(key: string, task: () => Promise<void>): () => void {
    this.tasks.set(key, task);
    return () => {
      if (this.tasks.get(key) === task) this.tasks.delete(key);
    };
  }

  async run(timeoutMs: number): Promise<void> {
    const all = async () => {
      // Each task reports its own failures; one failing doesn't stop the rest.
      for (const task of [...this.tasks.values()]) await Promise.allSettled([task()]);
    };
    await Promise.race([all(), delay(timeoutMs)]);
  }
}
