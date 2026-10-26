import { Plus } from "lucide-react";

import { DB_HEADER_COLORS } from "../../../../palette";
import { Button } from "@shared/ui/components/ui/button";
import { ColorPalette, CommitInput } from "@canvas-ui";
import { useBoardSchema } from "../schema";
import { EnumUsages } from "./enum-usages";
import { EnumValueRow } from "./enum-value-row";
import type { EnumVisualEditorProps } from "./enum-visual-editor.types";

/** Form view of one enum: name, color, values, and the columns that use it. */
export function EnumVisualEditor({ target }: EnumVisualEditorProps) {
  const schema = useBoardSchema();

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Enum name</span>
        <CommitInput
          value={target.name}
          onCommit={(name) => schema.updateEnum(target.id, { name })}
        />
      </label>

      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Header color</span>
        <div className="flex gap-0.5">
          <ColorPalette
            colors={DB_HEADER_COLORS}
            value={target.headerColor}
            onSelect={(headerColor) => schema.updateEnum(target.id, { headerColor })}
          />
        </div>
      </div>

      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">Values</h3>
          <Button variant="ghost" size="sm" onClick={() => schema.addEnumValue(target.id)}>
            <Plus />
            Add value
          </Button>
        </div>
        <ul>
          {target.values.map((value, index) => (
            <EnumValueRow key={value.id} target={target} value={value} index={index} />
          ))}
        </ul>
      </section>

      <EnumUsages enumId={target.id} />
    </div>
  );
}
