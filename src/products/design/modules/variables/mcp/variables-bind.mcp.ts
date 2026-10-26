import {
  asUndoStep,
  DOCUMENT_TOKENS,
  recordList,
  requireAxis,
  requireMode,
  requireVariable,
  setBindings,
  stringArg,
  stringList,
} from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../../mcp";
import { setVariableModes } from "../set-variable-modes";
import { requireStyle } from "./style-args";

/** Binding layers' fields to variables, and picking modes. */
export const variablesBindTools: DesignMcpTool[] = [
  {
    name: "bind_variables",
    description:
      "Makes layers' fields use variables, as one undo step: each binding gives layer ids, a " +
      'field path and a variable (id or name). Paths: "fills.N.color" / "strokes.N.color" ' +
      '(solid paints; the alpha sets the paint\'s opacity), "fills.N.stops.M.color", ' +
      '"effects.N.color" and effects\' "x", "y", "blur", "spread", "radius"; "opacity", "w", ' +
      '"h", "rotation", "strokeWeight", "strokeWeights.top", "cornerRadius", "layout.gap", ' +
      '"layout.counterGap", "layout.padding.left", texts\' "fontSize", "lineHeight" (a ' +
      'multiplier), "letterSpacing", "fontWeight"; polygons\' and stars\' "pointCount", stars\' ' +
      '"innerRadius"; text variables: texts\' "text", "fontFamily", "fontStyle" (a face name like ' +
      '"Bold Italic"); boolean variables: "visible", "layoutAbsolute", frames\' "clipsContent", ' +
      'masks\' "maskInverted". Styles (list_styles): "fills"/"strokes" take a paint style, ' +
      '"effects" an effect style, "strokeStyle" a stroke style, texts\' "textStyle" a text style ' +
      "(a range's: style_text_range's textStyle). get_nodes lists each layer's `bindings`. A " +
      "field written later by hand or by update_nodes is unlinked (a style: any field it sets).",
    inputSchema: {
      type: "object",
      required: ["bindings"],
      properties: {
        bindings: {
          type: "array",
          items: {
            type: "object",
            required: ["ids", "path", "variable"],
            properties: {
              ids: { type: "array", items: { type: "string" } },
              path: { type: "string" },
              variable: { type: "string" },
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const store = engine.service(DOCUMENT_TOKENS).store();
      const plan = recordList(args, "bindings").map((item) => {
        const ids = requireNodes(engine, stringList(item, "ids"));
        const path = stringArg(item, "path");
        const ref = stringArg(item, "variable");
        let target: string | null = null;
        for (const id of ids) {
          const el = engine.getElement(id);
          const field =
            el &&
            engine.kinds
              .kindOf(el)
              .bindable(el)
              .find((f) => f.path === path);
          if (!field) throw new Error(`Layer ${id} has no field "${path}" a variable can drive.`);
          if (field.type === "style") {
            const style = requireStyle(store, ref);
            if (style.styleType !== field.styleType) {
              throw new Error(`"${path}" takes another kind of style than ${style.name}.`);
            }
            target = style.id;
          } else {
            const variable = requireVariable(store, ref);
            if (field.type !== variable.type) {
              throw new Error(
                `"${path}" takes a ${field.type} variable; ${variable.name} is a ${variable.type}.`,
              );
            }
            target = variable.id;
          }
        }
        if (!target) throw new Error("Give at least one layer id.");
        return { ids, path, variable: target };
      });
      asUndoStep(engine.doc, () => {
        for (const { ids, path, variable } of plan) setBindings(engine.doc, ids, path, variable);
      });
      return { bound: plan.length };
    },
  },
  {
    name: "unbind_variables",
    description:
      "Unlinks layers' fields from variables (all of them, or `paths`); the fields keep the values " +
      "they show. One undo step.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: { type: "array", items: { type: "string" } },
        paths: { type: "array", items: { type: "string" } },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const only = args.paths === undefined ? null : new Set(stringList(args, "paths"));
      let count = 0;
      asUndoStep(engine.doc, () => {
        for (const id of ids) {
          for (const path of Object.keys(engine.doc.get(id)?.bindings ?? {})) {
            if (only && !only.has(path)) continue;
            setBindings(engine.doc, [id], path, null);
            count++;
          }
        }
      });
      return { unlinked: count };
    },
  },
  {
    name: "set_variable_mode",
    description:
      "Sets which mode of an axis a page or a frame/section/group (and everything in it) " +
      'uses, e.g. "Dark"; mode null goes back to inheriting it. Layers update in the same undo step.',
    inputSchema: {
      type: "object",
      required: ["target", "axis", "mode"],
      properties: {
        target: { type: "string", description: "A page id (list_pages) or a layer id." },
        axis: { type: "string", description: "The mode axis (id or name)." },
        mode: { type: ["string", "null"] },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const target = stringArg(args, "target");
      if (!engine.doc.get(target)) throw new Error(`No page or layer with id ${target}.`);
      const axis = requireAxis(engine.service(DOCUMENT_TOKENS).store(), stringArg(args, "axis"));
      const mode = args.mode === null ? null : requireMode(axis, stringArg(args, "mode"));
      asUndoStep(engine.doc, () => setVariableModes(engine.doc, [target], axis.id, mode));
      return { target, axis: axis.name, mode };
    },
  },
];
