import { useEffect, useRef, type ComponentType } from "react";

import type { CanvasMode } from "@canvas";
import type { ModuleHost } from "@shared/core";
import { useEngine, useEngineState } from "../../engine-context";
import { ModeToolbar } from "../mode-toolbar";
import type { EditorModeDefinition, ModePoints, ModeToolbarSpec } from "./editor-mode.types";
import { t } from "../modules.i18n";

/** A mode written as one object (it's returned as is; the type checks it). */
export function defineEditorMode<O extends object>(
  mode: EditorModeDefinition<O>,
): EditorModeDefinition<O> {
  return mode;
}

/**
 * Registers a mode into the product's points: its canvas mode, tools and commands, its switcher
 * entry and toolbar, its overlays (mounted only while it's on) and one session hook that runs its
 * commands and its enter/leave work, plus its own hooks.
 */
export function registerEditorMode<O extends object>(
  host: ModuleHost,
  { canvas, editor }: ModePoints<O>,
  mode: EditorModeDefinition<O>,
): void {
  const { id } = mode;
  const registered = (mode.tools ?? []).map((tool) => tool.id).filter((tool) => tool !== mode.tool);
  const canvasMode: CanvasMode = {
    id,
    tool: mode.tool,
    tools: [...(mode.allowTools ?? []), ...registered],
    ...(mode.isolate ? { isolate: mode.isolate } : {}),
    ...(mode.faded ? { faded: mode.faded } : {}),
    ...(mode.commands ? { commands: mode.commands } : {}),
    ...(mode.keybindings ? { keybindings: mode.keybindings } : {}),
  };
  host.contribute(canvas.modes, canvasMode);
  if (mode.tools?.length) host.contribute(canvas.tools, ...mode.tools);
  if (mode.hostCommands?.length) {
    host.contribute(
      canvas.hostCommands,
      ...mode.hostCommands.map(({ id: command, label, keys }) => ({
        id: command,
        label,
        ...(keys ? { keys } : {}),
      })),
    );
  }

  const toolbar = mode.toolbar && toolbarOf(mode.toolbar, mode.label, mode.icon);
  host.contribute(editor.modes, {
    id,
    label: mode.label,
    ...(mode.description ? { description: mode.description } : {}),
    icon: mode.icon,
    order: mode.order,
    ...(toolbar ? { toolbar } : {}),
  });

  host.contribute(
    editor.overlays,
    ...(mode.overlays ?? []).map((Overlay, index) => ({
      id: `${id}.overlay${index}`,
      component: whileOn(id, Overlay),
    })),
  );

  host.contribute(editor.sessionHooks, {
    id: `${id}.mode`,
    use: function useMode() {
      const engine = useEngine();
      const on = useEngineState((state) => state.mode === id);
      const was = useRef(on);
      useEffect(() => {
        const offs = (mode.hostCommands ?? []).flatMap(({ id: command, run }) =>
          run ? [engine.handleHostAction(command, () => run(engine))] : [],
        );
        return () => offs.forEach((off) => off());
      }, [engine]);
      useEffect(() => {
        if (on === was.current) return;
        was.current = on;
        if (on) mode.onEnter?.(engine);
        else mode.onLeave?.(engine);
      }, [engine, on]);
    },
  });
  host.contribute(
    editor.sessionHooks,
    ...(mode.hooks ?? []).map((use, index) => ({ id: `${id}.hook${index}`, use })),
  );
}

/** The toolbar component a mode's `toolbar` describes. */
function toolbarOf(
  spec: ModeToolbarSpec,
  label: string,
  icon: EditorModeDefinition<object>["icon"],
): ComponentType {
  if ("component" in spec) return spec.component;
  const title = { label, icon };
  const useItems = "useItems" in spec ? spec.useItems : () => spec;
  return function ModeToolbarOfMode() {
    return (
      <ModeToolbar
        title={title}
        label={t("editorMode.toolbarLabel", { mode: label })}
        items={useItems()}
      />
    );
  };
}

/** `Overlay`, drawn only while mode `id` is on. */
function whileOn(id: string, Overlay: ComponentType): ComponentType {
  return function ModeOverlay() {
    const on = useEngineState((state) => state.mode === id);
    return on ? <Overlay /> : null;
  };
}
