import { ChevronRight, GitFork } from "lucide-react";

import { ER_ENTITY_COLOR, SHAPE_STROKES } from "../../../../../palette";
import { Button, ChoiceCards, ListRow } from "@shared/ui/kit";
import { ColorPalette, CommitInput, useEngine } from "@canvas-ui";
import { lockedOn, useErDiagram, useErGate, useErShapes } from "../../model";
import { AttributeList } from "./attribute-list";
import { EntityTable } from "./entity-table";
import { FormField } from "./form-field";
import { FormSection } from "./form-section";
import { memberName } from "./shape-label";
import { useErGoTo } from "./use-er-go-to";
import { FormHint } from "./visual";
import type { EntityFormProps } from "./entity-form.types";
import { t } from "../../../er.i18n";

const COLORS = [
  { name: "Red", value: ER_ENTITY_COLOR },
  ...SHAPE_STROKES.filter((c) => c.value !== "transparent" && c.value !== ER_ENTITY_COLOR),
];
const ICON = "h-8 w-[52px] fill-none stroke-current stroke-[1.5]";

/** An entity: name, strong or weak, outline color, its table, attributes and where it's used. */
export function EntityForm({ entity }: EntityFormProps) {
  const engine = useEngine();
  const gate = useErGate();
  const er = useErDiagram();
  const shapes = useErShapes();
  const { goTo } = useErGoTo();
  const locked = lockedOn(gate, "weak-entities", entity.weak);
  const usedIn = [
    ...shapes.relations
      .filter((r) => r.participants.some((p) => p.entityId === entity.id))
      .map((r) => ({ id: r.id, label: `◇ ${r.name}` })),
    ...shapes.isas
      .filter((i) => i.parentId === entity.id || i.children.some((c) => c.entityId === entity.id))
      .map((i) => ({
        id: i.id,
        label:
          i.parentId === entity.id
            ? t("form.entity.itsHierarchy")
            : t("form.entity.parentHierarchy"),
      })),
    ...shapes.unions
      .filter((u) => u.categoryId === entity.id || u.superclassIds.includes(entity.id))
      .map((u) => ({
        id: u.id,
        label:
          u.categoryId === entity.id
            ? t("form.entity.itsUnion")
            : t("form.entity.unionOf", { name: memberName(shapes, u.categoryId) }),
      })),
  ];

  return (
    <div className="space-y-4">
      <FormField label={t("form.entity.name")}>
        <CommitInput
          value={entity.name}
          onCommit={(name) =>
            name.trim()
              ? void er.edits.updateEntity(entity.id, { name: name.trim() })
              : t("form.nameIt")
          }
        />
      </FormField>
      <FormSection title={t("form.entity.kind")}>
        <ChoiceCards
          label={t("form.entity.kind")}
          value={entity.weak ? "weak" : "strong"}
          onChange={(value) => er.edits.updateEntity(entity.id, { weak: value === "weak" })}
          options={[
            {
              value: "strong",
              label: t("form.entity.strong"),
              hint: t("form.entity.strongHint"),
              picture: (
                <svg viewBox="0 0 52 32" className={ICON} aria-hidden>
                  <rect x="8" y="7" width="36" height="18" />
                </svg>
              ),
            },
            {
              value: "weak",
              label: t("form.entity.weak"),
              hint: t("form.entity.weakHint"),
              disabled: locked.disabled,
              title: locked.reason || t("form.entity.weakTitle"),
              picture: (
                <svg viewBox="0 0 52 32" className={ICON} aria-hidden>
                  <rect x="6" y="5" width="40" height="22" />
                  <rect x="10" y="9" width="32" height="14" />
                </svg>
              ),
            },
          ]}
        />
      </FormSection>
      <FormSection title={t("form.entity.color")}>
        <div className="flex gap-0.5">
          <ColorPalette
            colors={COLORS}
            value={entity.color}
            onSelect={(color) => er.edits.updateEntity(entity.id, { color })}
          />
        </div>
      </FormSection>
      <FormSection title={t("form.table.title")}>
        <EntityTable entity={entity} />
      </FormSection>
      <AttributeList ownerId={entity.id} />
      <FormSection
        title={t("form.entity.usedIn")}
        actions={
          <Button
            variant="ghost"
            size="sm"
            title={gate.reason("hierarchies") || t("form.entity.specialize")}
            disabled={!gate.allows("hierarchies")}
            onClick={() => {
              const id = er.edits.addIsa(entity.id);
              if (id) engine.focusElement(id);
            }}
          >
            <GitFork />
            {t("form.entity.addHierarchy")}
          </Button>
        }
      >
        {usedIn.length === 0 ? (
          <FormHint>{t("form.entity.notInRelation")}</FormHint>
        ) : (
          <ul>
            {usedIn.map((item) => (
              <li key={item.id}>
                <ListRow
                  size="md"
                  onSelect={() => goTo(item.id)}
                  label={item.label}
                  meta={<ChevronRight className="size-3.5" />}
                />
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </div>
  );
}
