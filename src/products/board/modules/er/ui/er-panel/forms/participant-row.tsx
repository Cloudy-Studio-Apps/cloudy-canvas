import { Trash2 } from "lucide-react";

import type { ErParticipantPatch } from "../../../model/edits/edits.types";
import { CommitInput } from "@canvas-ui";
import { FlagToggle } from "../../../../db/ui";
import { useErDiagram } from "../../model";
import { IconAction } from "./icon-action";
import { ShapeSelect } from "./shape-select";
import { OpenShape } from "./visual";
import type { ParticipantRowProps } from "./participant-row.types";
import { t } from "../../../er.i18n";

/** One side of a relation, in More options: which entity, its role and arrow. */
export function ParticipantRow({ relation, participant, options }: ParticipantRowProps) {
  const er = useErDiagram();
  const update = (patch: ErParticipantPatch) =>
    er.edits.updateParticipant(relation.id, participant.id, patch);
  const name = options.find((o) => o.value === participant.entityId)?.label ?? "";

  return (
    <li className="space-y-1 py-1.5">
      <div className="flex items-center gap-1">
        <ShapeSelect
          aria-label={t("form.participant.entity")}
          value={participant.entityId}
          options={options}
          className="flex-1"
          onChange={(entityId) => update({ entityId })}
        />
        <OpenShape id={participant.entityId} label={name} />
        <IconAction
          label={t("form.participant.remove")}
          danger
          onClick={() => er.edits.removeParticipant(relation.id, participant.id)}
        >
          <Trash2 />
        </IconAction>
      </div>
      <div className="flex items-center gap-1">
        <CommitInput
          value={participant.role}
          placeholder={t("form.participant.rolePlaceholder")}
          aria-label={t("form.participant.role")}
          className="h-7 flex-1 text-xs"
          onCommit={(role) => void update({ role: role.trim() })}
        />
        <FlagToggle
          label={t("form.participant.arrow")}
          title={t("form.participant.arrowTitle")}
          on={participant.arrow}
          onToggle={() => update({ arrow: !participant.arrow })}
        />
      </div>
    </li>
  );
}
