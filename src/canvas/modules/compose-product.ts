import type { ModuleHost } from "@shared/core";

import type { CanvasProduct } from "../canvas-product.types";
import type { CanvasViewOptions } from "../canvas-view.types";
import { ElementKinds } from "../elements";
import { BASE_KEYBINDINGS, type Keybindings } from "../input";
import type { CanvasPoints } from "./canvas-points.types";

/**
 * The product the modules on `host` make up: their element kinds, tools, shortcuts, options and
 * hooks, chained in module order. Throws when two modules bind the same command or give the same
 * option.
 */
export function composeProduct<O extends object>(
  id: string,
  host: ModuleHost,
  points: CanvasPoints<O>,
): CanvasProduct<O> {
  const kinds = new ElementKinds<O>();
  for (const kind of host.get(points.kinds)) kinds.register(kind);

  const tools = host.get(points.tools);
  const hostCommands = host.get(points.hostCommands);
  const resolvers = host.get(points.resolveElements);
  const members = host.get(points.withMembers);
  const removers = host.get(points.onRemove);
  const preparers = host.get(points.prepareCopies);
  const textPasters = host.get(points.pasteText);
  const ontoPasters = host.get(points.pasteOnto);
  const imagePasters = host.get(points.pasteImage);
  const links = host.get(points.links);
  const movers = host.get(points.onMoved);
  const scopes = single(host.get(points.scopes), `the ${id}'s scopes`);
  const guides = single(host.get(points.guides), `where the ${id}'s ruler guides are kept`);
  const order = single(host.get(points.drawOrder), `the ${id}'s drawing order`);
  const clips = single(host.get(points.clips), `the ${id}'s clips`);
  const masks = single(host.get(points.masks), `the ${id}'s masks`);
  const undrawn = single(host.get(points.undrawn), `what the ${id} doesn't draw on its own`);
  const target = single(host.get(points.selectTarget), `what a click selects in the ${id}`);
  const aligner = single(host.get(points.alignTarget), `what one element aligns with in the ${id}`);
  const rulerFrame = single(host.get(points.rulerFrame), `what the ${id}'s rulers measure`);
  const frames = single(host.get(points.frames), `the frames N steps through in the ${id}`);
  const editor = single(host.get(points.editElement), `what double-click edits in the ${id}`);

  return {
    id,
    kinds,
    createTools: (ctx) => tools.map((tool) => tool.create(ctx)),
    keybindings: mergeKeybindings([
      BASE_KEYBINDINGS,
      ...tools.map((tool) => (tool.keys ? { [`tool.${tool.id}`]: tool.keys } : {})),
      ...hostCommands.map((command) => (command.keys ? { [command.id]: command.keys } : {})),
      ...host.get(points.keybindings),
    ]),
    hostCommands: hostCommands.map((command) => command.id),
    defaultOptions: mergeOptions<O>(host.get(points.options), "tool option"),
    view: mergeOptions<Partial<CanvasViewOptions>>(host.get(points.view), "view option"),
    ...(scopes ? { scopes } : {}),
    ...(guides ? { guides } : {}),
    ...(order ? { orderKeys: (elements) => order(elements, kinds) } : {}),
    ...(clips ? { clips: (elements) => clips(elements, kinds) } : {}),
    ...(masks ? { masks: (elements) => masks(elements, kinds) } : {}),
    ...(undrawn ? { undrawn: (elements) => undrawn(elements, kinds) } : {}),
    ...(editor ? { editElement: editor } : {}),
    ...(rulerFrame
      ? { rulerFrame: (selected, elements) => rulerFrame(selected, elements, kinds) }
      : {}),
    ...(frames ? { frames: (elements) => frames(elements, kinds) } : {}),
    ...(aligner ? { alignTarget: (el, elements) => aligner(el, elements, kinds) } : {}),
    ...(target
      ? { selectTarget: (hitId, request, elements) => target(hitId, request, elements, kinds) }
      : {}),
    ...(movers.length > 0
      ? {
          onMoved: (doc, moved, elements) => {
            for (const onMoved of movers) onMoved(doc, moved, elements, kinds);
          },
        }
      : {}),
    ...(links.length > 0 ? { createLinks: () => links.map((create) => create()) } : {}),
    ...(resolvers.length > 0
      ? {
          resolveElements: (elements) =>
            resolvers.reduce((resolved, resolve) => resolve(resolved, kinds), elements),
        }
      : {}),
    ...(members.length > 0
      ? {
          withMembers: (ids, elements, purpose) =>
            members.reduce<Set<string>>(
              (all, add) => add(all, elements, purpose, kinds),
              new Set(ids),
            ),
        }
      : {}),
    ...(removers.length > 0
      ? {
          onRemove: (doc, removed, before) => {
            for (const remove of removers) remove(doc, removed, before);
          },
        }
      : {}),
    ...(preparers.length > 0
      ? {
          prepareCopies: (copies, context) =>
            preparers.reduce((prepared, prepare) => prepare(prepared, context), copies),
        }
      : {}),
    ...(textPasters.length > 0
      ? {
          pasteText: (text, at, index, options) => {
            for (const paste of textPasters) {
              const el = paste(text, at, index, options);
              if (el) return el;
            }
            return null;
          },
        }
      : {}),
    ...(ontoPasters.length > 0
      ? {
          pasteOnto: (text, selected) => {
            for (const paste of ontoPasters) {
              const patches = paste(text, selected, kinds);
              if (patches) return patches;
            }
            return null;
          },
        }
      : {}),
    ...(imagePasters.length > 0
      ? {
          pasteImage: (image, view, index, options) => {
            for (const paste of imagePasters) {
              const el = paste(image, view, index, options);
              if (el) return el;
            }
            return null;
          },
        }
      : {}),
  };
}

function mergeKeybindings(all: readonly Keybindings[]): Keybindings {
  const merged: Record<string, Keybindings[string]> = {};
  for (const bindings of all) {
    for (const [command, keys] of Object.entries(bindings)) {
      if (command in merged) throw new Error(`The command "${command}" is bound twice.`);
      merged[command] = keys;
    }
  }
  return merged;
}

function mergeOptions<O extends object>(all: readonly Partial<O>[], what: string): O {
  const merged: Record<string, unknown> = {};
  for (const options of all) {
    for (const [key, value] of Object.entries(options)) {
      if (key in merged) throw new Error(`The ${what} "${key}" is given twice.`);
      merged[key] = value;
    }
  }
  // Each module gives the values it owns; together they're the whole set.
  return merged as O;
}

/** The one contribution to a point only one module may fill (`what` names it in the error). */
function single<T>(items: readonly T[], what: string): T | undefined {
  if (items.length > 1) throw new Error(`Only one module can give ${what}.`);
  return items[0];
}
