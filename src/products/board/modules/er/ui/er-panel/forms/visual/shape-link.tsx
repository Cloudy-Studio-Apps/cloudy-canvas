import { cn } from "@shared/ui/kit";
import { useErGoTo } from "../use-er-go-to";
import type { ShapeLinkProps } from "./shape-link.types";
import { t } from "../../../../er.i18n";

/** A shape's name in a menu: clicking it selects that shape. */
export function ShapeLink({ id, label, children, className }: ShapeLinkProps) {
  const { goTo } = useErGoTo();
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a name that reads as a link
    <button
      type="button"
      title={t("form.select", { name: label })}
      className={cn(
        "max-w-full cursor-pointer truncate rounded-xs underline decoration-primary/50 underline-offset-2 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      onClick={() => goTo(id)}
    >
      {children ?? label}
    </button>
  );
}
