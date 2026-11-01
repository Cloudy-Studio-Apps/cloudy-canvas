import type { ErAttributePatch } from "../../../model/edits/edits.types";
import { lockedOn, useErDiagram, useErGate } from "../../model";
import { AttributeOval, ToggleTile } from "./visual";
import type { AttributeFormProps } from "./attribute-form.types";
import { t } from "../../../er.i18n";

const PLAIN = { key: "none", multivalued: false, derived: false, optional: false } as const;

/** What an attribute is, as the ovals each choice draws. */
export function AttributeFlags({ attribute }: AttributeFormProps) {
  const er = useErDiagram();
  const gate = useErGate();
  const key = (value: "pk" | "partial" | "alternate"): ErAttributePatch => ({
    key: attribute.key === value ? "none" : value,
  });
  const flags = [
    {
      id: "key",
      look: { key: "pk" },
      on: attribute.key === "pk",
      patch: key("pk"),
      title: t("form.attribute.keyTitle"),
    },
    {
      id: "partial",
      look: { key: "partial" },
      on: attribute.key === "partial",
      patch: key("partial"),
      title: t("form.attribute.partialTitle"),
    },
    {
      id: "alternate",
      look: { key: "alternate" },
      construct: "alternate-keys",
      on: attribute.key === "alternate",
      patch: key("alternate"),
      title: t("form.attribute.alternateTitle"),
    },
    {
      id: "multi",
      look: { multivalued: true },
      construct: "multivalued-attributes",
      on: attribute.multivalued,
      patch: { multivalued: !attribute.multivalued },
      title: t("form.attribute.multiTitle"),
    },
    {
      id: "derived",
      look: { derived: true },
      construct: "derived-attributes",
      on: attribute.derived,
      patch: { derived: !attribute.derived },
      title: t("form.attribute.derivedTitle"),
    },
    {
      id: "optional",
      look: { optional: true },
      construct: "optional-attributes",
      on: attribute.optional,
      patch: { optional: !attribute.optional },
      title: t("form.attribute.optionalTitle"),
    },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-1">
      {flags.map((flag) => {
        const construct = "construct" in flag ? flag.construct : undefined;
        const locked = construct ? lockedOn(gate, construct, flag.on) : undefined;
        return (
          <ToggleTile
            key={flag.id}
            stacked
            picture={<AttributeOval attribute={{ ...PLAIN, ...flag.look }} />}
            label={t(`form.attribute.flag.${flag.id}`)}
            hint={t(`form.attribute.flag.${flag.id}Hint`)}
            title={locked?.reason || flag.title}
            on={flag.on}
            disabled={locked?.disabled}
            onToggle={() => er.edits.updateAttribute(attribute.id, flag.patch)}
          />
        );
      })}
    </div>
  );
}
