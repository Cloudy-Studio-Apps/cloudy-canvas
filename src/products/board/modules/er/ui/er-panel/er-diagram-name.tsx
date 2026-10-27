import { useState } from "react";

import { Input } from "@shared/ui/kit";
import type { ErDiagramNameProps } from "./er-diagram-name.types";
import { t } from "../../er.i18n";

/** The diagram's name, edited in place; renamed on Enter or when leaving the field. */
export function ErDiagramName({ name, onRename }: ErDiagramNameProps) {
  const [value, setValue] = useState(name);
  const commit = () => {
    if (value.trim() !== name) onRename(value);
  };
  return (
    <Input
      aria-label={t("panel.diagramName")}
      placeholder={t("untitledDiagram")}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        const input = event.currentTarget;
        if (event.key === "Enter") input.blur();
        if (event.key === "Escape") {
          setValue(name);
          requestAnimationFrame(() => input.blur());
        }
      }}
      className="h-7 min-w-0 flex-1 border-transparent bg-transparent px-1.5 text-sm font-semibold shadow-none hover:border-input"
    />
  );
}
