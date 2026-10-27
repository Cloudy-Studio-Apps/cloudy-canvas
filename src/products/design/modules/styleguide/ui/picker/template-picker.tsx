import { useStyleguide } from "../hooks/use-styleguide";
import { TemplateCard } from "./template-card";
import type { TemplatePickerProps } from "./picker.types";
import { t } from "../../styleguide.i18n";

/** The templates a category can be drawn with, as thumbnails of the file's own tokens. */
export function TemplatePicker({ category, group, current, options, onPick }: TemplatePickerProps) {
  const { templates } = useStyleguide();
  const own = templates.filter((template) => template.category === category.id);
  if (own.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("templates.none")}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {own.map((template) => (
        <TemplateCard
          key={template.id}
          category={category}
          group={group}
          template={template}
          options={options}
          selected={template.id === current}
          onPick={() => onPick(template)}
        />
      ))}
    </div>
  );
}
