import { asUndoStep, optionalBoolean, stringArg } from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../agent";
import { createPresetFrame } from "./create-preset-frame";
import { FRAME_PRESET_GROUPS, FRAME_PRESETS, findPreset } from "./frame-presets";

/** Frame presets, as the frame tool's sidebar offers them. */
export const frameTools: DesignAgentTool[] = [
  {
    name: "list_frame_presets",
    description:
      "The frame sizes the frame tool offers (phones, tablets, desktops, presentations, watches, " +
      "paper, social media), by group: id, label, w, h. Use an id as a frame's preset in " +
      "create_nodes, or with add_preset_frame.",
    inputSchema: { type: "object", properties: {} },
    run: () =>
      FRAME_PRESET_GROUPS.map(({ group, presets }) => ({
        group,
        presets: presets.map(({ id, label, size }) => ({ id, label, ...size })),
      })),
  },
  {
    name: "add_preset_frame",
    description:
      "Adds a frame of a preset's size, named after it, to the right of what's on the page (or at " +
      "0, 0 on an empty page), as picking a preset in the frame tool's sidebar does. One undo " +
      "step; returns the frame's id and bounds.",
    inputSchema: {
      type: "object",
      required: ["preset"],
      properties: {
        preset: { type: "string", description: "A preset id from list_frame_presets." },
        zoom: { type: "boolean", description: "Zoom the user's view to the new frame." },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const id = stringArg(args, "preset");
      const preset = findPreset(id);
      if (!preset) {
        const ids = FRAME_PRESETS.map((item) => item.id).join(", ");
        throw new Error(`No frame preset "${id}". Use one of: ${ids}.`);
      }
      const frame = createPresetFrame(preset, engine.doc, engine.elements());
      asUndoStep(engine.doc, () => engine.doc.add(frame));
      if (optionalBoolean(args, "zoom")) engine.zoomToElement(frame.id);
      const { x, y, w, h, name } = frame;
      return { id: frame.id, name, x, y, w, h };
    },
  },
];
