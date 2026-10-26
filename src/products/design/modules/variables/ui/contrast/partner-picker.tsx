import { Plus } from "lucide-react";

import { DOCUMENT_TOKENS } from "@canvas";
import { VariablePicker } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import type { PartnerPickerProps } from "./contrast-ui.types";

/** "+ Pair with…": declares a color this one is read on (it's the text, the other the surface). */
export function PartnerPicker({ variable }: PartnerPickerProps) {
  const engine = useDesignEngine();
  return (
    <VariablePicker
      type="color"
      scopes={[]}
      value={null}
      modes={{}}
      onPick={(id) => {
        const pairs = new Set(variable.contrastWith ?? []);
        pairs.add(id);
        engine.service(DOCUMENT_TOKENS).updateVariable(variable.id, { contrastWith: [...pairs] });
      }}
    >
      <Button variant="outline" size="xs">
        <Plus /> Pair with…
      </Button>
    </VariablePicker>
  );
}
