import { Trash2 } from "lucide-react";

import type { ErParticipantPatch } from "@board";
import { CommitInput } from "@canvas-ui";
import { FlagToggle } from "../../../../db/ui/db-panel/flag-toggle";
import { useErDiagram, useErGate, useErShapes } from "../../model";
import { CardinalityPicker } from "./cardinality-picker";
import { IconAction } from "./icon-action";
import { ShapeSelect } from "./shape-select";
import type { ParticipantRowProps } from "./participant-row.types";

/** One entity taking part in a relation: which, its cardinality, join attribute, role and arrow. */
export function ParticipantRow({ relation, participant, options }: ParticipantRowProps) {
  const er = useErDiagram();
  const gate = useErGate();
  const joinOptions = useErShapes()
    .attributes.filter((a) => a.ownerId === participant.entityId)
    .map((a) => ({ value: a.id, label: a.key === "pk" ? `${a.name} (key)` : a.name }));
  const update = (patch: ErParticipantPatch) =>
    er.edits.updateParticipant(relation.id, participant.id, patch);

  return (
    <li className="space-y-1 py-1.5">
      <div className="flex items-center gap-1">
        <ShapeSelect
          aria-label="Entity"
          value={participant.entityId}
          options={options}
          className="flex-1"
          onChange={(entityId) => update({ entityId })}
        />
        <CardinalityPicker
          min={participant.min}
          max={participant.max}
          onChange={(min, max) => update({ min, max })}
        />
        <IconAction
          label="Remove from the relation"
          danger
          onClick={() => er.edits.removeParticipant(relation.id, participant.id)}
        >
          <Trash2 />
        </IconAction>
      </div>
      <ShapeSelect
        aria-label="Join attribute"
        value={participant.via}
        options={joinOptions}
        placeholder="Joins by: no attribute"
        className="w-full text-xs"
        // Choosing one is blocked when the standard has no join attributes; one set can be cleared.
        disabled={!participant.via && !gate.allows("join-attributes")}
        title={participant.via ? undefined : gate.reason("join-attributes") || undefined}
        onChange={(via) => update({ via })}
      />
      <div className="flex items-center gap-1">
        <CommitInput
          value={participant.role}
          placeholder="Role (for an entity related to itself)"
          aria-label="Role"
          className="h-7 flex-1 text-xs"
          onCommit={(role) => void update({ role: role.trim() })}
        />
        <FlagToggle
          label="Arrow"
          title="Arrowhead at the entity end"
          on={participant.arrow}
          onToggle={() => update({ arrow: !participant.arrow })}
        />
      </div>
    </li>
  );
}
