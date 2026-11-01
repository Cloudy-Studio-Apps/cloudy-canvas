import { ChevronRight } from "lucide-react";

import { IconAction } from "../icon-action";
import { useErGoTo } from "../use-er-go-to";
import type { OpenShapeProps } from "./open-shape.types";
import { t } from "../../../../er.i18n";

/** The › beside a field: selects the shape it names, as picking a value never does. */
export function OpenShape({ id, label }: OpenShapeProps) {
  const { goTo } = useErGoTo();
  if (!id) return null;
  return (
    <IconAction label={t("form.select", { name: label })} onClick={() => goTo(id)}>
      <ChevronRight />
    </IconAction>
  );
}
