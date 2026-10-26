import { requireDesign, type DesignAgentTool } from "../../../agent";
import { describeSystem } from "./describe-system";
import type { StyleguideToolSources } from "./styleguide-agent.types";

/** Reading the Design system. */
export function styleguideReadTools(sources: StyleguideToolSources): DesignAgentTool[] {
  return [
    {
      name: "get_design_system",
      description:
        "The Design system: the design's variables and styles laid out as a style guide on a " +
        "hidden page (the Design system view), category by category (cover, colors, typography, " +
        "spacing, …) and group by group, each drawn by a template with options. Returns the " +
        "categories in order (hidden or not, the template in effect, their groups), every " +
        "template with its options, and the live design-system elements placed on pages. Live " +
        "elements are frames whose layers are generated from the tokens and kept up to date: " +
        "don't edit those layers (they're rebuilt); change the element with set_system_template, " +
        "or make it ordinary layers with convert_system_element.",
      inputSchema: { type: "object", properties: {} },
      run: (host) => describeSystem(requireDesign(host).engine, sources),
    },
  ];
}
