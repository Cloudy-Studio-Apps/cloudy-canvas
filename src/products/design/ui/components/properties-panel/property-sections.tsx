import { useEditorModules } from "@canvas-ui";
import { useDesignEngine } from "../../design-engine-context";
import { useSceneElements, useSelectedNodes } from "../../hooks";
import { designEditor, type PropertySelection } from "../../modules";
import type { PropertySectionsProps } from "./property-sections.types";

/** The sections the modules contributed that apply to the selection, in order. */
export function PropertySections({ only }: PropertySectionsProps) {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const nodes = useSelectedNodes();
  const elements = useSceneElements();
  const selection: PropertySelection = { nodes, kinds: engine.kinds, elements };
  const sections = host
    .get(designEditor.propertySections)
    .filter((section) => !only || only.includes(section.id))
    .filter((section) => section.when(selection))
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {sections.map(({ id, component: Section }) => (
        <Section key={id} selection={selection} />
      ))}
    </>
  );
}
