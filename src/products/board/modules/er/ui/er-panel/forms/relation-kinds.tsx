import type * as React from "react";

import type { ErRelationElement } from "../../../relation/relation.types";
import { lockedOn, useErDiagram, useErGate } from "../../model";
import { FormSection } from "./form-section";
import { ToggleTile } from "./visual";
import type { RelationFormProps, RelationKindGlyphProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

const DIAMOND = "M20 2 37 15 20 28 3 15Z";

function Glyph({ inner, letter }: RelationKindGlyphProps) {
  return (
    <svg
      viewBox="0 0 40 30"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-[30px] w-10"
    >
      {inner}
      {letter && (
        <text
          x={20}
          y={19}
          textAnchor="middle"
          stroke="none"
          fill="currentColor"
          className="text-[11px] font-bold"
        >
          {letter}
        </text>
      )}
    </svg>
  );
}

const PLAIN_KINDS = [
  {
    id: "identifying",
    field: "identifying",
    construct: "identifying-relations",
    picture: (
      <Glyph
        inner={
          <>
            <path d={DIAMOND} />
            <path d="M20 7 31 15 20 23 9 15Z" />
          </>
        }
      />
    ),
  },
  {
    id: "associative",
    field: "associative",
    construct: "associative-entities",
    picture: (
      <Glyph
        inner={
          <>
            <rect x="1" y="3" width="38" height="24" />
            <path d="M20 5 35 15 20 25 5 15Z" />
          </>
        }
      />
    ),
  },
  {
    id: "iMark",
    field: "idMark",
    construct: "dependency-marks",
    picture: <Glyph inner={<path d={DIAMOND} />} letter="I" />,
  },
  {
    id: "eMark",
    field: "existenceMark",
    construct: "dependency-marks",
    picture: <Glyph inner={<path d={DIAMOND} />} letter="E" />,
  },
] as const satisfies readonly {
  id: string;
  field: keyof ErRelationElement;
  construct: string;
  picture: React.ReactNode;
}[];

/** What kind of relation it is, as the diamonds each kind draws. */
export function RelationKinds({ relation }: RelationFormProps) {
  const er = useErDiagram();
  const gate = useErGate();
  return (
    <FormSection title={t("form.relation.kind")}>
      <div className="grid grid-cols-2 gap-1">
        {PLAIN_KINDS.map((kind) => {
          const on = relation[kind.field];
          const locked = lockedOn(gate, kind.construct, on);
          return (
            <ToggleTile
              key={kind.id}
              picture={kind.picture}
              label={t(`form.relation.${kind.id}`)}
              hint={t(`form.relation.${kind.id}Hint`)}
              title={locked.reason || t(`form.relation.${kind.id}Title`)}
              on={on}
              disabled={locked.disabled}
              onToggle={() => er.edits.updateRelation(relation.id, { [kind.field]: !on })}
            />
          );
        })}
      </div>
    </FormSection>
  );
}
