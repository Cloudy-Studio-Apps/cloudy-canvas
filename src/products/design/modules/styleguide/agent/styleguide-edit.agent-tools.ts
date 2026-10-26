import {
  asUndoStep,
  optionalBoolean,
  optionalChoice,
  optionalNumber,
  optionalString,
  stringList,
  TokenStore,
} from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../../agent";
import { DESIGN_PAGES } from "../../pages";
import { DESIGN_STYLEGUIDE } from "../model";
import { groupKey, isSheet } from "../sheet";
import { readCategory, readGroup, readTemplate } from "./styleguide-args";
import type { StyleguideToolSources } from "./styleguide-agent.types";

const MODE_VIEWS = ["current", "all"] as const;

const TEMPLATE_PROPS = {
  template: { type: "string", description: "A template id of the category (get_design_system)." },
  options: {
    type: "object",
    description: "The template's options, by id; missing ones keep their default.",
  },
  modeView: { enum: MODE_VIEWS, description: '"all" draws every mode side by side.' },
};

/** Changing the Design system and its live elements. */
export function styleguideEditTools(sources: StyleguideToolSources): DesignAgentTool[] {
  return [
    {
      name: "set_system_template",
      description:
        "Sets how the Design system draws a category (its default template), one of its groups " +
        "(an override; clear: true goes back to the category's), or a live element (`element`: " +
        "its own template; clear: true uses the configured one). `hidden` shows or hides a " +
        "category or group in the view; `modeView` alone sets the view's; `order` (category ids) sets the " +
        "view's category order (those left out follow in their own).",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string" },
          group: { type: "string" },
          element: { type: "string", description: "A live element's id." },
          ...TEMPLATE_PROPS,
          hidden: { type: "boolean" },
          clear: { type: "boolean" },
          order: { type: "array", items: { type: "string" }, description: "Category ids." },
        },
      },
      run: (host, args) => {
        const { engine } = requireDesign(host);
        const styleguide = engine.service(DESIGN_STYLEGUIDE);
        const modeView = optionalChoice(args, "modeView", MODE_VIEWS);
        const elementId = optionalString(args, "element");
        if (elementId) {
          const el = engine.getElement(elementId) ?? engine.doc.get(elementId);
          if (!isSheet(el)) throw new Error(`"${elementId}" isn't a live design-system element.`);
          const category = sources.categories().find((c) => c.id === el.sheet.category);
          const picked = category ? readTemplate(sources, category, args) : undefined;
          asUndoStep(engine.doc, () =>
            styleguide.setSheet(elementId, {
              ...(optionalBoolean(args, "clear") ? { template: null, options: null } : {}),
              ...(picked ? { template: picked.template.id, options: { ...picked.options } } : {}),
              ...(modeView ? { modeView } : {}),
            }),
          );
          return { element: elementId };
        }
        if (!styleguide.page()) throw new Error("The design has no variables or styles yet.");
        const order = args.order === undefined ? undefined : stringList(args, "order");
        if (order) {
          const known = new Set(sources.categories().map((c) => c.id));
          const unknown = order.filter((id) => !known.has(id));
          if (unknown.length > 0) {
            throw new Error(
              `Unknown categories: ${unknown.join(", ")} (valid: ${[...known].join(", ")}).`,
            );
          }
        }
        if (args.category === undefined) {
          if (!modeView && !order) {
            throw new Error('Give a "category", an "element", "order" or "modeView".');
          }
          asUndoStep(engine.doc, () => {
            if (order) styleguide.setOrder(order);
            if (modeView) styleguide.setModeView(modeView);
          });
          return { ...(order ? { order } : {}), ...(modeView ? { modeView } : {}) };
        }
        const category = readCategory(sources, args);
        const group = readGroup(
          category,
          category.groups(TokenStore.of(engine.doc), engine.doc),
          args,
        );
        const key = group ? groupKey(category.id, group) : category.id;
        const picked = readTemplate(sources, category, args);
        const hidden = optionalBoolean(args, "hidden");
        asUndoStep(engine.doc, () => {
          if (optionalBoolean(args, "clear")) styleguide.setChoice(key, null);
          if (picked)
            styleguide.setChoice(key, {
              template: picked.template.id,
              options: { ...picked.options },
            });
          if (hidden !== undefined) styleguide.setHidden(key, hidden);
          if (modeView) styleguide.setModeView(modeView);
          if (order) styleguide.setOrder(order);
        });
        return { category: category.id, ...(group ? { group } : {}) };
      },
    },
    {
      name: "add_system_element",
      description:
        "Places a live design-system element on a page (the page you're on unless `page`): a " +
        "frame drawing a category, or one group of it, with a template, kept up to date as the " +
        "variables and styles change. Placed right of the page's content unless x/y are given.",
      inputSchema: {
        type: "object",
        required: ["category"],
        properties: {
          category: { type: "string" },
          group: { type: "string" },
          page: { type: "string", description: "A page id (list_pages)." },
          x: { type: "number" },
          y: { type: "number" },
          ...TEMPLATE_PROPS,
        },
      },
      run: (host, args) => {
        const { engine } = requireDesign(host);
        const category = readCategory(sources, args);
        const groups = category.groups(TokenStore.of(engine.doc), engine.doc);
        const group = readGroup(category, groups, args);
        const pageId = optionalString(args, "page") ?? engine.scope;
        if (!pageId || !engine.service(DESIGN_PAGES).page(pageId)) {
          throw new Error(`No page "${String(pageId)}". Call list_pages for their ids.`);
        }
        const picked = readTemplate(sources, category, args);
        const x = optionalNumber(args, "x");
        const y = optionalNumber(args, "y");
        const title = group ? groups.find((g) => g.id === group)?.title : "";
        const id = asUndoStep(engine.doc, () =>
          engine
            .service(DESIGN_STYLEGUIDE)
            .addSheet(
              pageId,
              { category: category.id, group },
              title || category.label,
              x !== undefined && y !== undefined ? { x, y } : undefined,
              {
                ...(picked ? { template: picked.template.id, options: { ...picked.options } } : {}),
                modeView: optionalChoice(args, "modeView", MODE_VIEWS) ?? "current",
              },
            ),
        );
        return { id, page: pageId };
      },
    },
    {
      name: "convert_system_element",
      description:
        "Turns live design-system elements into ordinary layers: they stop updating, and their " +
        "layers become editable while keeping their variable bindings. The Design system view's " +
        "own sections can't be converted (add one to a page first).",
      inputSchema: {
        type: "object",
        required: ["ids"],
        properties: { ids: { type: "array", items: { type: "string" } } },
      },
      run: (host, args) => {
        const { engine } = requireDesign(host);
        const ids = stringList(args, "ids");
        const converted = asUndoStep(engine.doc, () =>
          engine.service(DESIGN_STYLEGUIDE).convert(ids),
        );
        if (converted.length === 0) throw new Error("None of these is a live element on a page.");
        return { converted };
      },
    },
  ];
}
