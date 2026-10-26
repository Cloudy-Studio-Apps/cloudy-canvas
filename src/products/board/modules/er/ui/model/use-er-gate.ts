import { useMemo } from "react";

import { constructGate } from "../../base/constructs/construct-gate";
import { erStandards } from "../../base/standards/er-standard-registry";
import { standardOf } from "../../model/standard-of";
import type { ErConstructGate } from "../../base/constructs/er-construct.types";
import { useErQuery } from "./use-er-query";

/** What the shown diagram's standard lets the editor add (re-read when its standard changes). */
export function useErGate(): ErConstructGate {
  const id = useErQuery((diagram) => standardOf(diagram.shapes()).id);
  return useMemo(() => constructGate(erStandards.resolve(id)), [id]);
}

/**
 * A toggle's lock: it can't be turned on when the standard forbids the construct (turning it off,
 * to fix the error, always works).
 */
export function lockedOn(
  gate: ErConstructGate,
  construct: string,
  on: boolean,
): { disabled: boolean; reason: string } {
  const reason = on ? "" : gate.reason(construct);
  return { disabled: reason !== "", reason };
}
