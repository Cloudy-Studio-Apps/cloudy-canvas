import { Section } from "@shared/ui/kit";
import type { MoreOptionsProps } from "./more-options.types";
import { t } from "../../../er.i18n";

/** What's needed less often, folded away. */
export function MoreOptions({ children }: MoreOptionsProps) {
  return (
    <Section
      title={t("form.more")}
      collapsible
      defaultOpen={false}
      className="border-b-0 px-0 py-0"
    >
      <div className="space-y-2">{children}</div>
    </Section>
  );
}
