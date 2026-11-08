import { flushSync } from "react-dom";

import { Emitter } from "@canvas";
import { notifyError } from "@shared/stores/toast-store";
import type { DesignEngine } from "../../../../design-engine.types";
import {
  applyInteraction,
  DEFAULT_TRANSITION,
  DESIGN_PROTOTYPE,
  isScreen,
  startSession,
} from "../../model";
import type { OverlayEntry, PlayerState, PlayTarget, PrototypeInteraction } from "../../model";
import { performStep } from "./perform-step";
import type { OverlayParts, PlayerView, StepContext } from "./player-run.types";
import type { ScreenPictures } from "./screen-pictures";
import { t } from "../../prototype.i18n";

const BACK: PrototypeInteraction = {
  id: "player.back",
  trigger: "click",
  action: "back",
  transition: DEFAULT_TRANSITION,
};
const CLOSE: PrototypeInteraction = { ...BACK, id: "player.close", action: "close" };

/**
 * One play of a flow: its session (`PlayerState`) and the stage it's animated on. Every action
 * goes through `applyInteraction`, then its step plays (`performStep`); input is ignored while one
 * plays. Screens deleted meanwhile drop out of the session (back to the flow's start when the one
 * shown goes). React reads it with `useSyncExternalStore` (`subscribe`, `snapshot`).
 */
export class PlayerRun {
  private view: PlayerView;
  private busy = false;
  private idle: Promise<unknown> = Promise.resolve();
  private readonly changes = new Emitter();
  private ghostEl: HTMLElement | null = null;
  private baseEl: HTMLElement | null = null;
  private readonly overlays = new Map<OverlayEntry, HTMLElement>();
  private scale = 1;
  private attached = false;

  constructor(
    private readonly engine: DesignEngine,
    private readonly target: PlayTarget,
    private readonly pictures: ScreenPictures,
  ) {
    this.view = { state: this.fresh(target.at), epoch: 0 };
  }

  readonly subscribe = (listener: () => void): (() => void) => this.changes.subscribe(listener);
  readonly snapshot = (): PlayerView => this.view;
  /** The stage's refs: the layer old screens play out in, and the screen under the overlays. */
  readonly setGhost = (el: HTMLElement | null): void => {
    this.ghostEl = el;
  };
  readonly setBase = (el: HTMLElement | null): void => {
    this.baseEl = el;
  };

  /**
   * While the player is open: follows the document (screens that go drop out). Returns the function
   * that stops, after which no picture is drawn any more.
   */
  attach(): () => void {
    this.attached = true;
    const off = this.engine.doc.onChange(() => {
      const state = this.valid(this.view.state);
      if (state !== this.view.state) this.show(state, false);
    });
    return () => {
      this.attached = false;
      off();
    };
  }

  /** An overlay's layer on the stage, until the returned function forgets it. */
  attachOverlay(entry: OverlayEntry, el: HTMLElement): () => void {
    this.overlays.set(entry, el);
    return () => {
      if (this.overlays.get(entry) === el) this.overlays.delete(entry);
    };
  }

  /** Pixels per world unit the screens are drawn at, as the stage fits the device. */
  setScale(scale: number): void {
    this.scale = scale;
  }

  isBusy(): boolean {
    return this.busy;
  }

  /** Settles once the step playing now (if any) has. */
  whenIdle(): Promise<unknown> {
    return this.idle;
  }

  /** Does what an interaction says; resolves to the overlay it opened, if any. */
  run(ix: PrototypeInteraction): Promise<OverlayEntry | null> {
    if (this.busy) return Promise.resolve(null);
    const { state, step } = applyInteraction(this.view.state, ix, this.exists);
    if (step.kind === "none") return Promise.resolve(null);
    this.busy = true;
    const done = performStep(step, state, this.stage)
      .catch((error: unknown) => {
        notifyError(t("player.failed"), error);
        return null;
      })
      .finally(() => {
        this.busy = false;
      });
    this.idle = done;
    return done;
  }

  back(): void {
    void this.run(BACK);
  }

  /** Closes the top overlay (a click outside it). */
  closeTop(): void {
    void this.run(CLOSE);
  }

  /** Once nothing plays, closes `entry` if it's still on top (a hover or a press let go of). */
  closeIfTop(entry: OverlayEntry): void {
    void this.idle.then(() => {
      if (this.view.state.overlays.at(-1) === entry) void this.run(CLOSE);
    });
  }

  /** Back to the screen the session began at, with nothing open. */
  restart(): void {
    if (this.busy) return;
    this.view = { state: this.fresh(this.view.state.stack[0]?.screen), epoch: this.view.epoch + 1 };
    this.changes.emit();
  }

  private readonly stage: StepContext = {
    commit: (next) => this.show(this.valid(next), true),
    preload: async (id) => {
      const screen = this.engine.doc.get(id);
      if (!this.attached || !isScreen(screen)) return;
      await this.pictures.load(screen, this.scale).catch(() => undefined);
    },
    ghost: () => this.ghostEl,
    base: () => this.baseEl,
    overlay: (entry) => this.overlayParts(entry),
  };

  private show(state: PlayerState, sync: boolean): void {
    this.view = { ...this.view, state };
    if (sync) flushSync(() => this.changes.emit());
    else this.changes.emit();
  }

  /** The state without the screens that are gone; the flow's start when the shown one went. */
  private valid(state: PlayerState): PlayerState {
    const stack = state.stack.filter((entry) => this.exists(entry.screen));
    const overlays = state.overlays.filter((entry) => this.exists(entry.screen));
    if (stack.length === state.stack.length && overlays.length === state.overlays.length) {
      return state;
    }
    return stack.length > 0 ? { ...state, stack, overlays } : this.fresh();
  }

  private fresh(at?: string): PlayerState {
    const flow = this.engine.service(DESIGN_PROTOTYPE).flow(this.target.flow);
    if (!flow) return { flow: this.target.flow, stack: [], overlays: [] };
    return startSession(flow, at !== undefined && this.exists(at) ? at : undefined);
  }

  /** Whether a screen can show: a screen of the flow's page. */
  private readonly exists = (id: string): boolean => {
    const screen = this.engine.doc.get(id);
    const flow = this.engine.service(DESIGN_PROTOTYPE).flow(this.target.flow);
    return isScreen(screen) && flow !== null && screen.pageId === flow.page;
  };

  private overlayParts(entry: OverlayEntry): OverlayParts | null {
    const layer = this.overlays.get(entry);
    const page = layer?.querySelector<HTMLElement>("[data-part='page']");
    const backdrop = layer?.querySelector<HTMLElement>("[data-part='backdrop']");
    return page && backdrop ? { page, backdrop } : null;
  }
}
