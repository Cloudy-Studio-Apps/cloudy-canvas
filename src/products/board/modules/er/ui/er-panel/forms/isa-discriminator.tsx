import { CommitInput } from "@canvas-ui";
import { useErDiagram, useErQuery, useErShapes } from "../../model";
import { tableOfShape } from "../../../model";
import { FormSection } from "./form-section";
import { memberName } from "./shape-label";
import { useErGoTo } from "./use-er-go-to";
import { AttributeOval, FormHint, TableCard } from "./visual";
import type { IsaFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

/** The attribute that tells a hierarchy's children apart, with what its column would hold. */
export function IsaDiscriminator({ isa }: IsaFormProps) {
  const er = useErDiagram();
  const shapes = useErShapes();
  const model = useErQuery((diagram) => diagram.tablesModel());
  const { goTo } = useErGoTo();
  const attribute = shapes.attributes.find((a) => a.ownerId === isa.id);
  const key = tableOfShape(model, isa.parentId)?.pk[0] ?? "";

  return (
    <FormSection title={t("form.isa.apart")}>
      <FormHint>{t("form.isa.apartHint")}</FormHint>
      <div className="flex items-center gap-1">
        {attribute && (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: the attribute's own oval
          <button
            type="button"
            aria-label={t("form.select", { name: attribute.name })}
            title={t("form.select", { name: attribute.name })}
            className="shrink-0 cursor-pointer rounded-sm text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            onClick={() => goTo(attribute.id)}
          >
            <AttributeOval attribute={attribute} />
          </button>
        )}
        <CommitInput
          className="min-w-0 flex-1"
          value={attribute?.name ?? ""}
          placeholder={t("form.isa.discriminatorExample")}
          aria-label={t("form.isa.discriminator")}
          onCommit={(name) => void er.edits.setDiscriminator(isa.id, name.trim())}
        />
      </div>
      {attribute && (
        <>
          <TableCard
            title={memberName(shapes, isa.parentId)}
            rows={[
              { id: "disc:key", name: key, key: "own", tag: attribute.name },
              ...isa.children.map((child, i) => ({
                id: `disc:${child.id}`,
                name: String(i + 1),
                key: null,
                tag: memberName(shapes, child.entityId),
              })),
            ]}
          />
          <FormHint>{t("form.effect.discriminator")}</FormHint>
        </>
      )}
    </FormSection>
  );
}
