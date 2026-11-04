import { Braces, ChevronDown, ChevronRight } from "lucide-react";

import { ListRow } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import type { FieldGroupRowProps } from "./field-group-row.types";

/** An object in each row (`dimensions`): opens to show its fields. */
export function FieldGroupRow({
  node,
  depth,
  count,
  open,
  onToggle,
  children,
}: FieldGroupRowProps) {
  return (
    <li className="flex flex-col">
      <ListRow
        depth={depth}
        aria-expanded={open}
        icon={
          <span className="flex items-center gap-1 text-muted-foreground">
            {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            <Braces className="size-3.5" />
          </span>
        }
        label={<code className="font-medium">{node.name}</code>}
        meta={t("fields.groupCount", { count })}
        onSelect={onToggle}
      />
      {open && <ul className="flex flex-col">{children}</ul>}
    </li>
  );
}
