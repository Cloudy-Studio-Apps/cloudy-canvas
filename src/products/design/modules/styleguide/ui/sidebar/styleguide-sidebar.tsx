import { groupKey } from "../../sheet/template-choice";
import { Button, Section } from "@shared/ui/kit";
import { useStyleguide, useStyleguideOutline } from "../hooks/use-styleguide";
import { useTemplateChoice } from "../hooks/use-template-choice";
import { useStyleguideViewStore } from "../stores/styleguide-view-store";
import { ChoiceEditor } from "./choice-editor";
import { ModesSwitch } from "./modes-switch";
import { SystemOverview } from "./system-overview";

/**
 * The properties panel in the Design system mode (its `sidebar`): for the category or
 * group picked, its template and options (a category's default; a group's override); otherwise
 * the view's settings and export.
 */
export function StyleguideSidebar() {
  const { styleguide } = useStyleguide();
  const outline = useStyleguideOutline();
  const selected = useStyleguideViewStore((state) => state.selected);
  const entry = outline.find((item) => item.category.id === selected?.category);
  const group = entry?.groups.find((g) => g.id === selected?.group);
  const choice = useTemplateChoice(entry?.category, group?.id);
  if (!entry || !choice) return <SystemOverview />;
  const key = group ? groupKey(entry.category.id, group.id) : entry.category.id;
  const overridden = group ? key in styleguide.settings().choices : false;
  return (
    <Section title={group ? group.title || entry.category.label : entry.category.label}>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          {group
            ? "This group's template. Unless you pick one, it uses its category's."
            : "The template every group of this category uses, unless a group picks its own."}
        </p>
        {overridden && (
          <Button size="xs" variant="outline" onClick={() => styleguide.setChoice(key, null)}>
            Use the category&apos;s template
          </Button>
        )}
        <ChoiceEditor
          category={entry.category}
          group={group?.id}
          choice={choice}
          onChoose={(template, options) =>
            styleguide.setChoice(key, { template: template.id, options: { ...options } })
          }
        />
        <ModesSwitch />
      </div>
    </Section>
  );
}
