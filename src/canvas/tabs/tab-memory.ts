import type { LeaveTarget, TabLeaveGuard } from "./file-tabs.types";
import { TAB_POLICY_INTERVAL_MS } from "./tab-limits";
import type { TabMemoryHost } from "./tab-memory.types";
import { agentCalling, mayHibernate, planTabStates } from "./tab-policy";

/**
 * Applies the memory policy to a `FileTabs`' background tabs (see the README): after every change
 * and on a timer, each goes to the state `planTabStates` gives it, a headless one's editor going
 * only once the host readied it (`TabLeaveGuard`).
 */
export class TabMemory {
  private readonly host: TabMemoryHost;
  private guard: TabLeaveGuard | null = null;
  /** Background tabs on their way down from `headless`, left alone meanwhile. */
  private readonly leaving = new Set<string>();
  /** Tabs whose host kept their editor (changes nothing would save), until the next timed run. */
  private readonly kept = new Set<string>();
  /** Tabs whose leaving failed and was reported (once each). */
  private readonly warned = new Set<string>();
  /** Whether autosave is on (`setAutosave`). */
  private autosave = true;
  private queued = false;
  private disposed = false;
  private readonly stopWatching: () => void;

  constructor(host: TabMemoryHost) {
    this.host = host;
    this.stopWatching = host.store.subscribe(() => this.queue());
  }

  /** Sets what the host does before an editor goes; returns how to remove it. */
  setGuard(guard: TabLeaveGuard): () => void {
    this.guard = guard;
    return () => {
      if (this.guard === guard) this.guard = null;
    };
  }

  /** Tells the policy whether autosave is on (off, a hosted file's tab keeps its editor). */
  setAutosave(enabled: boolean): void {
    if (this.autosave === enabled) return;
    this.autosave = enabled;
    this.kept.clear();
    this.queue();
  }

  evaluate(): void {
    if (this.disposed) return;
    const { tabs, activeId } = this.host.store.get();
    const { leaving, autosave } = this;
    const plan = planTabStates({ tabs, activeId, now: this.host.now(), leaving, autosave });
    for (const [id, state] of plan) {
      const tab = this.host.get(id);
      if (!tab || tab.state === state) continue;
      // The plan only lowers a headless tab: its editor goes through `leave`.
      if (tab.state !== "headless") this.host.setState(id, state);
      else if ((state === "document" || state === "hibernated") && !this.kept.has(id))
        void this.leave(id, state);
    }
  }

  /** Runs `evaluate` every `TAB_POLICY_INTERVAL_MS`, trying kept tabs again; returns how to stop. */
  start(): () => void {
    const timer = setInterval(() => {
      this.kept.clear();
      this.evaluate();
    }, TAB_POLICY_INTERVAL_MS);
    this.evaluate();
    return () => clearInterval(timer);
  }

  /** Forgets a closed tab. */
  forget(id: string): void {
    this.kept.delete(id);
    this.warned.delete(id);
  }

  dispose(): void {
    this.disposed = true;
    this.stopWatching();
  }

  /**
   * Takes a background tab's editor away, toward `target`: the host readies it first (its save
   * and preview), and it stays mounted until then. Shown again meanwhile, it keeps it. Going to
   * `hibernated`, the document is destroyed only once the editor is gone and the save it started
   * then is done.
   */
  private async leave(id: string, target: LeaveTarget): Promise<void> {
    const { host } = this;
    this.leaving.add(id);
    try {
      const guard = this.guard;
      if (guard && !(await guard.prepare(id, target))) {
        this.kept.add(id);
        return;
      }
      // An agent call that began while the host readied it keeps the editor.
      const ready = host.get(id);
      if (ready?.state !== "headless" || agentCalling(ready, host.now())) return;
      host.setState(id, "document");
      if (target !== "hibernated") return;
      if (guard) await this.whileDocument(id, guard.unmounted(id));
      const tab = host.get(id);
      if (tab?.state === "document" && mayHibernate(tab)) host.setState(id, "hibernated");
    } catch (error) {
      // The editor stays; the policy tries again on its next timed run.
      this.kept.add(id);
      if (!this.warned.has(id)) {
        this.warned.add(id);
        console.warn(`File tab ${id} couldn't let its editor go.`, error);
      }
    } finally {
      this.leaving.delete(id);
      // What changed meanwhile (autosave turned off, say) may move it again.
      this.queue();
    }
  }

  /** Waits for `work`, or until the tab is no longer `document` (shown again, closed). */
  private async whileDocument(id: string, work: Promise<void>): Promise<void> {
    let stop = (): void => undefined;
    const left = new Promise<void>((resolve) => {
      stop = this.host.store.subscribe(() => {
        if (this.host.get(id)?.state !== "document") resolve();
      });
    });
    try {
      await Promise.race([work, left]);
    } finally {
      stop();
    }
  }

  /** Runs `evaluate` once after the current change (changes made together are evaluated once). */
  private queue(): void {
    if (this.queued || this.disposed) return;
    this.queued = true;
    queueMicrotask(() => {
      this.queued = false;
      this.evaluate();
    });
  }
}
