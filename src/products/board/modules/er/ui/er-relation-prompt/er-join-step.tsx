import { useState } from "react";

import { Button } from "@shared/ui/kit";
import { ShapeSelect } from "../er-panel/forms/shape-select";
import { useErModel, useErVersion } from "../model";
import { ErRelationGlyph } from "./er-relation-glyph";
import type { ErJoinStepProps, ErJoinValue } from "./er-relation-prompt.types";
import { defaultJoin, joinAttributes, joinOptions, newKeyName } from "./join-options";
import { t } from "../../er.i18n";

/**
 * Step two: for each end the other links to (the "one" side, or both in many-to-many), which of
 * its attributes the join goes through: its key by default, a new key, or none.
 */
export function ErJoinStep({ ratio, from, to, onBack, onCreate }: ErJoinStepProps) {
  const er = useErModel();
  useErVersion();
  const ends = { from, to };
  const attributesOf = (side: "from" | "to") => {
    const entity = ends[side];
    return joinAttributes(entity, er.diagram(entity.diagram).shapes().attributes);
  };
  const [joins, setJoins] = useState(
    () => new Map(ratio.joins.map((side) => [side, defaultJoin(attributesOf(side))])),
  );
  const nameOf = (side: "from" | "to") => {
    const el = ends[side];
    return "name" in el ? el.name : "";
  };
  const set = (side: "from" | "to", value: ErJoinValue) =>
    setJoins((current) => new Map(current).set(side, value));

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate(joins);
      }}
    >
      <div className="flex items-center gap-2 px-1">
        <ErRelationGlyph from={ratio.from} to={ratio.to} />
        <span className="text-sm font-medium">{ratio.label}</span>
      </div>
      {ratio.joins.map((side) => {
        const other = side === "from" ? "to" : "from";
        const attributes = attributesOf(side);
        const newKey = newKeyName(attributes);
        return (
          <label key={side} className="flex flex-col gap-1 px-1 text-xs text-muted-foreground">
            {ratio.joins.length > 1
              ? t("prompt.joinsBy", { name: nameOf(side) })
              : t("prompt.linksTo", { other: nameOf(other), name: nameOf(side) })}
            <ShapeSelect
              aria-label={t("prompt.joinAttribute", { name: nameOf(side) })}
              value={joins.get(side) ?? ""}
              options={joinOptions(attributes, newKey)}
              onChange={(value) => set(side, value)}
            />
          </label>
        );
      })}
      <div className="flex justify-between gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {t("prompt.back")}
        </Button>
        <Button type="submit" size="sm" autoFocus>
          {t("prompt.create")}
        </Button>
      </div>
    </form>
  );
}
