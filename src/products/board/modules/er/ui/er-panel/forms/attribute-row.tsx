import { ChevronRight, Trash2 } from "lucide-react";

import type { ErAttributePatch } from "../../../model/edits/edits.types";
import { CommitInput } from "@canvas-ui";
import { useErDiagram } from "../../model";
import { IconAction } from "./icon-action";
import { useErGoTo } from "./use-er-go-to";
import { AttributeOval } from "./visual";
import type { AttributeRowProps } from "./attribute-row.types";
import { t } from "../../../er.i18n";

/** One attribute in a list: its oval selects it, and its name can be changed right here. */
export function AttributeRow({ attribute }: AttributeRowProps) {
  const er = useErDiagram();
  const { goTo } = useErGoTo();
  const update = (patch: ErAttributePatch) => er.edits.updateAttribute(attribute.id, patch);
  const select = t("form.select", { name: attribute.name });

  return (
    <li className="flex items-center gap-1">
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the attribute's own oval */}
      <button
        type="button"
        aria-label={select}
        title={select}
        className="shrink-0 cursor-pointer rounded-sm text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40"
        onClick={() => goTo(attribute.id)}
      >
        <AttributeOval attribute={attribute} />
      </button>
      <CommitInput
        value={attribute.name}
        aria-label={t("form.attribute.name")}
        className="h-7 min-w-0 flex-1 text-sm"
        onCommit={(name) => (name.trim() ? void update({ name: name.trim() }) : t("form.nameIt"))}
      />
      <IconAction label={select} onClick={() => goTo(attribute.id)}>
        <ChevronRight />
      </IconAction>
      <IconAction
        label={t("form.attribute.delete")}
        danger
        onClick={() => er.edits.removeAttribute(attribute.id)}
      >
        <Trash2 />
      </IconAction>
    </li>
  );
}
