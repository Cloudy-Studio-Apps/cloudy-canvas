import type { OverlayEntry, PlayerState, PlayerStep } from "../../model";
import { openLink } from "./open-link";
import { hideOverlay, showOverlay } from "./overlay-transition";
import type { StepContext } from "./player-run.types";
import { runTransition } from "./run-transition";

/**
 * Plays what an interaction did (`applyInteraction`'s step) on the stage and shows `next`: a new
 * screen comes in over a copy of the old one with its transition; an overlay comes in, goes out
 * reversed, or takes the top one's place (its backdrop stays); a link opens in the browser.
 * Resolves to the overlay it opened, so a hover or a press can close it when let go.
 */
export async function performStep(
  step: PlayerStep,
  next: PlayerState,
  ctx: StepContext,
): Promise<OverlayEntry | null> {
  switch (step.kind) {
    case "none":
      return null;
    case "link":
      openLink(step.url);
      return null;
    case "screen": {
      await ctx.preload(step.to);
      const shown = ctx.base();
      const old = shown ? (shown.cloneNode(true) as HTMLElement) : null;
      if (old) ctx.ghost()?.append(old);
      ctx.commit(next);
      const fresh = ctx.base();
      if (fresh) await runTransition(old, fresh, step.transition);
      else old?.remove();
      return null;
    }
    case "openOverlay": {
      await ctx.preload(step.entry.screen);
      ctx.commit(next);
      const parts = ctx.overlay(step.entry);
      if (parts) await showOverlay(parts.page, parts.backdrop, step.entry.interaction.transition);
      return step.entry;
    }
    case "swapOverlay": {
      await ctx.preload(step.to.screen);
      ctx.commit(next);
      const parts = ctx.overlay(step.to);
      if (parts) await showOverlay(parts.page, null, step.to.interaction.transition);
      return step.to;
    }
    case "closeOverlay": {
      const parts = ctx.overlay(step.entry);
      const remove = () => ctx.commit(next);
      if (parts) {
        await hideOverlay(parts.page, parts.backdrop, step.entry.interaction.transition, remove);
      } else {
        await Promise.resolve();
        remove();
      }
      return null;
    }
  }
}
