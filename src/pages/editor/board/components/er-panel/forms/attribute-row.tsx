import { ArrowDown, ArrowUp, ListTree, Trash2 } from "lucide-react";

import type { ErAttributePatch, ErAttributeShape } from "@engine";
import { CommitInput } from "../../db-panel/commit-input";
import { FlagToggle } from "../../db-panel/flag-toggle";
import { IconAction } from "./icon-action";
import type { AttributeRowProps } from "./attribute-row.types";
import { useErDiagram } from "../../../engine/use-er-query";

/** One attribute: name, flags, order and delete; a composite one lists its parts under it. */
export function AttributeRow({ attribute, partsOf, first, last, depth }: AttributeRowProps) {
  const er = useErDiagram();
  const parts = partsOf.get(attribute.id) ?? [];
  const update = (patch: ErAttributePatch) => er.edits.updateAttribute(attribute.id, patch);
  const flags: { label: string; title: string; on: boolean; patch: () => ErAttributePatch }[] = [
    {
      label: "PK",
      title: "Key attribute (underlined)",
      on: attribute.key === "pk",
      patch: () => ({ key: attribute.key === "pk" ? "none" : "pk" }),
    },
    {
      label: "PK~",
      title: "Partial key of a weak entity (dashed underline)",
      on: attribute.key === "partial",
      patch: () => ({ key: attribute.key === "partial" ? "none" : "partial" }),
    },
    {
      label: "Multi",
      title: "Multivalued (double ellipse)",
      on: attribute.multivalued,
      patch: () => ({ multivalued: !attribute.multivalued }),
    },
    {
      label: "Derived",
      title: "Derived (dashed ellipse)",
      on: attribute.derived,
      patch: () => ({ derived: !attribute.derived }),
    },
    {
      label: "Opt",
      title: "Optional (half-filled circle in the lollipop style)",
      on: attribute.optional,
      patch: () => ({ optional: !attribute.optional }),
    },
  ];

  return (
    <li className="space-y-1 py-1.5" style={{ paddingLeft: depth * 14 }}>
      <div className="flex items-center gap-0.5">
        <CommitInput
          value={attribute.name}
          aria-label="Attribute name"
          className="h-7 min-w-0 flex-1 text-sm"
          onCommit={(name) => (name.trim() ? void update({ name: name.trim() }) : "Name it")}
        />
        <IconAction
          label="Move up"
          disabled={first}
          onClick={() => er.edits.moveAttribute(attribute.id, -1)}
        >
          <ArrowUp />
        </IconAction>
        <IconAction
          label="Move down"
          disabled={last}
          onClick={() => er.edits.moveAttribute(attribute.id, 1)}
        >
          <ArrowDown />
        </IconAction>
        <IconAction
          label="Add a part (composite attribute)"
          onClick={() => er.edits.addAttribute(attribute.id)}
        >
          <ListTree />
        </IconAction>
        <IconAction
          label="Delete attribute"
          danger
          onClick={() => er.edits.removeAttribute(attribute.id)}
        >
          <Trash2 />
        </IconAction>
      </div>
      <div className="flex flex-wrap gap-1">
        {flags.map((flag) => (
          <FlagToggle
            key={flag.label}
            label={flag.label}
            title={flag.title}
            on={flag.on}
            onToggle={() => update(flag.patch())}
          />
        ))}
      </div>
      {parts.length > 0 && (
        <ul>
          {parts.map((part: ErAttributeShape, i) => (
            <AttributeRow
              key={part.id}
              attribute={part}
              partsOf={partsOf}
              first={i === 0}
              last={i === parts.length - 1}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
