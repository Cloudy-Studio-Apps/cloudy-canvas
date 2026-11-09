import {
  asUndoStep,
  optionalBoolean,
  optionalChoice,
  optionalString,
  stringArg,
  type ToolArgs,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import type { DesignWorkspace } from "../../../design-engine.types";
import { DESIGN_PAGES } from "../../pages";
import {
  addFlowRecord,
  defaultFlowDevice,
  DESIGN_PROTOTYPE,
  flowPatch,
  isScreen,
  PROTOTYPE_DEVICES,
  type PrototypeFlowElement,
  type PrototypeFlowPatch,
  type PrototypePlatform,
} from "../model";
import { PROTOTYPE_PLATFORMS } from "../prototype.constants";
import { describeFlow } from "./describe-flow";

const PAGE_SCHEMA = {
  type: "string",
  description: "A design page's id (pages_list). Default: your design page.",
};

const FLOW_SCHEMA = { type: "string", description: "A flow's id (prototype_flows_list)." };

const ORIENTATIONS = ["portrait", "landscape"] as const;

/** The design page an agent named (`page`), else its own. */
function readPage(engine: DesignWorkspace, args: ToolArgs): string {
  const id = optionalString(args, "page") ?? engine.scope;
  if (id === null || !engine.service(DESIGN_PAGES).page(id)) {
    throw new Error(`There's no design page "${id ?? ""}" (see pages_list).`);
  }
  return id;
}

function readFlow(engine: DesignWorkspace, args: ToolArgs): PrototypeFlowElement {
  const id = stringArg(args, "flow");
  const flow = engine.service(DESIGN_PROTOTYPE).flow(id);
  if (!flow) throw new Error(`There's no flow with the id "${id}" (see prototype_flows_list).`);
  return flow;
}

/** Throws unless `start` is a screen of `page`. */
function requireStart(engine: DesignWorkspace, page: string, start: string): void {
  const screen = engine.doc.get(start);
  if (!isScreen(screen) || screen.pageId !== page) {
    throw new Error(`"${start}" isn't a screen (top-level frame) of the design page "${page}".`);
  }
}

/** The changes to a flow's platform, device, orientation and hints, checked against `platform`. */
function readSettings(args: ToolArgs, current: PrototypePlatform): PrototypeFlowPatch {
  const platform = optionalChoice(args, "platform", PROTOTYPE_PLATFORMS);
  const device = optionalString(args, "device");
  const orientation = optionalChoice(args, "orientation", ORIENTATIONS);
  const hints = optionalBoolean(args, "hints");
  const effective = platform ?? current;
  if (device !== undefined && !PROTOTYPE_DEVICES[effective].includes(device)) {
    throw new Error(
      `"device" for ${effective} must be one of: ${PROTOTYPE_DEVICES[effective].join(", ")}.`,
    );
  }
  const patch: PrototypeFlowPatch = {};
  if (platform !== undefined) patch.platform = platform;
  if (device !== undefined) patch.device = device;
  if (orientation !== undefined) patch.orientation = orientation;
  if (hints !== undefined) patch.hints = hints;
  return patch;
}

/** Listing, making, changing and deleting a design's prototype flows. */
export const flowTools: DesignMcpTool[] = [
  {
    name: "flows_list",
    description:
      "The prototype flows of a design page (the Prototype mode): id, name, starting screen " +
      "(`start`, its id, and `startName`), platform and device. A flow says which screen a " +
      "prototype starts at and which device it plays on. A screen is a top-level frame of a " +
      "design page; layers inside screens get interactions (prototype_interactions_get, prototype_interactions_set) " +
      "that link screens together. Every other flow tool takes one of these ids as `flow`.",
    inputSchema: { type: "object", properties: { page: PAGE_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const page = readPage(engine, args);
      const flows = engine.service(DESIGN_PROTOTYPE).flows(page);
      return { designPage: page, flows: flows.map((flow) => describeFlow(engine.doc, flow)) };
    },
  },
  {
    name: "flow_set",
    description:
      "Creates or changes a prototype flow, in one undo step. Without `flow` it creates one on " +
      "`page` (default: your design page) and needs `start`: the id of a screen (a top-level " +
      'frame) of that page; `name` defaults to "<screen> flow", and the platform and device ' +
      "to what the screen's size suggests (wider than 600 units: web, else mobile). With `flow` " +
      "it changes the fields given (`page` can't change). `platform` is mobile, tablet, desktop " +
      "or web, and `device` must belong to it: mobile iphone-16 (default), iphone-se, pixel-9; " +
      "tablet ipad-air (default), galaxy-tab; desktop window-mac (default), window-windows, " +
      "window-linux; web browser-1280 (default), browser-1440, browser-fit. A new `platform` " +
      "without `device` gets its default device. `orientation` (portrait or landscape) is for " +
      "mobile and tablet. `hints`: a missed click flashes the clickable areas when playing. " +
      "Returns the flow.",
    inputSchema: {
      type: "object",
      properties: {
        flow: FLOW_SCHEMA,
        page: PAGE_SCHEMA,
        name: { type: "string" },
        start: { type: "string", description: "The id of a screen of the flow's page." },
        platform: { type: "string", enum: [...PROTOTYPE_PLATFORMS] },
        device: { type: "string" },
        orientation: { type: "string", enum: [...ORIENTATIONS] },
        hints: { type: "boolean" },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const { doc } = engine;
      const name = optionalString(args, "name");
      const start = optionalString(args, "start");
      if (args.flow === undefined || args.flow === null) {
        const page = readPage(engine, args);
        if (start === undefined) throw new Error('Give "start": the id of a screen of the page.');
        requireStart(engine, page, start);
        const screen = doc.get(start);
        const settings = readSettings(
          args,
          defaultFlowDevice({ w: isScreen(screen) ? screen.w : 0 }).platform,
        );
        const id = asUndoStep(doc, () => {
          const flow = addFlowRecord(doc, page, start, name);
          const patch = flowPatch(flow, settings);
          if (Object.keys(patch).length > 0) doc.update(flow.id, patch);
          return flow.id;
        });
        return describeFlow(doc, engine.service(DESIGN_PROTOTYPE).flow(id) as PrototypeFlowElement);
      }
      const flow = readFlow(engine, args);
      if (args.page !== undefined && args.page !== null && args.page !== flow.page) {
        throw new Error("A flow can't move to another page: remove it and make a new one.");
      }
      if (start !== undefined) requireStart(engine, flow.page, start);
      const patch = flowPatch(flow, {
        ...readSettings(args, flow.platform),
        ...(name !== undefined ? { name } : {}),
        ...(start !== undefined ? { start } : {}),
      });
      if (Object.keys(patch).length > 0) asUndoStep(doc, () => doc.update(flow.id, patch));
      return describeFlow(doc, engine.service(DESIGN_PROTOTYPE).flow(flow.id) ?? flow);
    },
  },
  {
    name: "flow_remove",
    description: "Deletes a prototype flow, in one undo step. Its screens and links stay.",
    inputSchema: {
      type: "object",
      required: ["flow"],
      properties: { flow: FLOW_SCHEMA },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const flow = readFlow(engine, args);
      asUndoStep(engine.doc, () => engine.doc.remove([flow.id]));
      return { deleted: flow.id };
    },
  },
];
