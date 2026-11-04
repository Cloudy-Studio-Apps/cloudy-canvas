import { asUndoStep, stringArg } from "@canvas";
import { getLocale } from "@shared/core";

import { isDesignNode } from "../../core";
import { requireDesign, type DesignAgentContext, type DesignMcpTool } from "../../../mcp";
import { bindData, dataFieldsOf, planBindings } from "../bindings";
import { scopeAt } from "../repeat";
import { readBindPatch } from "./bind-data-args";

const DESCRIPTION =
  "Binds a layer to data from the design's data sources, in one undo step; the layer is filled " +
  "right away (and again whenever a source is updated). Only what you pass changes; null " +
  "removes. `text` (text layers) is a template: write a field in braces with the source's name " +
  'first, `{products[0].name}`; quote keys with spaces or odd characters `{products[0]["Unit ' +
  "Price\"]}`; `{products.$count}` is a list's length; `{{` writes a literal brace. The words " +
  "`{page}`, `{pages}`, `{title}`, `{section}`, `{date}` and `{toc}` are catalog words, not " +
  "data, and stay as text; a text a catalog fills can't be bound. The layer's current style is " +
  "kept (setting the same text keeps its styled ranges). `bindings` maps a layer's field path " +
  '("fills.0.color", "opacity", "w" and "h" for the size, "fills.0.image" for a picture) to ' +
  "{ path, format? } " +
  "(path is an expression such as products[0].price; format is a field format like { decimals, " +
  "currency, dateStyle }) or null to unbind; the data's type must fit the field (colors need " +
  "color values, numbers need numbers, pictures need image fields). Binding a field replaces " +
  "its variable binding. Editing a bound field by hand unlinks it. Pictures must have been " +
  "downloaded by update_data_source first, or the layer keeps its picture. `visibleWhen` " +
  "{ path, op: exists|empty|eq|neq|gt|lt|contains, value? } shows the layer only while it " +
  "holds; `hideWhenEmpty` hides a layer whose text or picture comes out empty. Numbers, " +
  "prices and dates are written in the app's language. Returns the layer's data fields and " +
  "`missing`: expressions that read nothing (a typo, or a source not updated yet), and " +
  "`unreadable`: what was left as it is because its source's saved data isn't on this device.";

/** Binds a layer's text, fields and visibility to data. */
export const bindDataTool = ({ kinds }: DesignAgentContext): DesignMcpTool => ({
  name: "bind_data",
  description: DESCRIPTION,
  inputSchema: {
    type: "object",
    required: ["layer"],
    properties: {
      layer: { type: "string", description: "The layer's id." },
      text: { type: ["string", "null"], description: "A text layer's template; null stops it." },
      bindings: {
        type: "object",
        description: "Field path to { path, format? }, or null to unbind that field.",
      },
      visibleWhen: {
        type: ["object", "null"],
        description: "{ path, op, value? }; null removes the condition.",
      },
      hideWhenEmpty: { type: "boolean", description: "Hide the layer while its data is empty." },
    },
  },
  run: async (host, args) => {
    const { engine } = requireDesign(host);
    const id = stringArg(args, "layer");
    const el = engine.doc.get(id);
    if (!el || !isDesignNode(el)) throw new Error(`No layer with id ${id}.`);
    const patch = readBindPatch(el, args);
    asUndoStep(engine.doc, () => bindData(engine.doc, id, patch, scopeAt(engine.doc, id), kinds));
    const after = engine.doc.get(id);
    if (!after || !isDesignNode(after)) throw new Error(`No layer with id ${id}.`);
    const planned = planBindings(after, scopeAt(engine.doc, id), {
      kinds,
      locale: getLocale(),
      images: () => null,
    });
    return {
      layer: id,
      data: dataFieldsOf(after),
      missing: planned.missing,
      ...(planned.unreadable.length > 0 ? { unreadable: planned.unreadable } : {}),
    };
  },
});
