import { ArrowDown, ArrowUp, ListTree, Trash2 } from "lucide-react";

import type { ErAttributePatch } from "../../../model/edits/edits.types";
import type { ErAttributeElement } from "../../../attribute/attribute.types";
import { CommitInput } from "@canvas-ui";
import { FlagToggle } from "../../../../db/ui";
import { lockedOn, useErDiagram, useErGate } from "../../model";
import { IconAction } from "./icon-action";
import type { AttributeRowProps } from "./attribute-row.types";
import { t } from "../../../er.i18n";

/** One attribute: name, flags, order and delete; a composite one lists its parts under it. */
export function AttributeRow({ attribute, partsOf, first, last, depth }: AttributeRowProps) {
  const er = useErDiagram();
  const parts = partsOf.get(attribute.id) ?? [];
  const update = (patch: ErAttributePatch) => er.edits.updateAttribute(attribute.id, patch);
  const gate = useErGate();
  const flags: {
    label: string;
    title: string;
    on: boolean;
    construct?: string;
    patch: () => ErAttributePatch;
  }[] = [
    {
      label: "PK",
      title: t("form.attribute.keyTitle"),
      on: attribute.key === "pk",
      patch: () => ({ key: attribute.key === "pk" ? "none" : "pk" }),
    },
    {
      label: "PK~",
      title: t("form.attribute.partialTitle"),
      on: attribute.key === "partial",
      patch: () => ({ key: attribute.key === "partial" ? "none" : "partial" }),
    },
    {
      label: "AK",
      title: t("form.attribute.alternateTitle"),
      construct: "alternate-keys",
      on: attribute.key === "alternate",
      patch: () => ({ key: attribute.key === "alternate" ? "none" : "alternate" }),
    },
    {
      label: t("form.attribute.multi"),
      title: t("form.attribute.multiTitle"),
      construct: "multivalued-attributes",
      on: attribute.multivalued,
      patch: () => ({ multivalued: !attribute.multivalued }),
    },
    {
      label: t("form.attribute.derived"),
      title: t("form.attribute.derivedTitle"),
      construct: "derived-attributes",
      on: attribute.derived,
      patch: () => ({ derived: !attribute.derived }),
    },
    {
      label: t("form.attribute.optional"),
      title: t("form.attribute.optionalTitle"),
      construct: "optional-attributes",
      on: attribute.optional,
      patch: () => ({ optional: !attribute.optional }),
    },
  ];

  return (
    <li className="space-y-1 py-1.5" style={{ paddingLeft: depth * 14 }}>
      <div className="flex items-center gap-0.5">
        <CommitInput
          value={attribute.name}
          aria-label={t("form.attribute.name")}
          className="h-7 min-w-0 flex-1 text-sm"
          onCommit={(name) => (name.trim() ? void update({ name: name.trim() }) : t("form.nameIt"))}
        />
        <IconAction
          label={t("form.moveUp")}
          disabled={first}
          onClick={() => er.edits.moveAttribute(attribute.id, -1)}
        >
          <ArrowUp />
        </IconAction>
        <IconAction
          label={t("form.moveDown")}
          disabled={last}
          onClick={() => er.edits.moveAttribute(attribute.id, 1)}
        >
          <ArrowDown />
        </IconAction>
        <IconAction
          label={gate.reason("composite-attributes") || t("form.attribute.addPart")}
          disabled={!gate.allows("composite-attributes")}
          onClick={() => er.edits.addAttribute(attribute.id)}
        >
          <ListTree />
        </IconAction>
        <IconAction
          label={t("form.attribute.delete")}
          danger
          onClick={() => er.edits.removeAttribute(attribute.id)}
        >
          <Trash2 />
        </IconAction>
      </div>
      <div className="flex flex-wrap gap-1">
        {flags.map((flag) => {
          const locked = flag.construct ? lockedOn(gate, flag.construct, flag.on) : undefined;
          return (
            <FlagToggle
              key={flag.label}
              label={flag.label}
              title={locked?.reason || flag.title}
              on={flag.on}
              disabled={locked?.disabled}
              onToggle={() => update(flag.patch())}
            />
          );
        })}
      </div>
      {parts.length > 0 && (
        <ul>
          {parts.map((part: ErAttributeElement, i) => (
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
