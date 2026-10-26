import { templateOptions } from "@design";
import { SelectableCard } from "@shared/ui/kit";
import { useSheetPreview } from "../hooks/use-sheet-preview";
import { SpecPreview } from "../preview/spec-preview";
import type { TemplateCardProps } from "./picker.types";

/** A template as a card: a thumbnail of the real tokens drawn with it, its name and what it is. */
export function TemplateCard({
  category,
  group,
  template,
  options,
  selected,
  onPick,
}: TemplateCardProps) {
  // Another template's thumbnail uses the options it has in common with the current one.
  const specs = useSheetPreview(category, group, template, templateOptions(template, options));
  return (
    <SelectableCard
      selected={selected}
      onSelect={onPick}
      media={<SpecPreview specs={specs} height={112} />}
      title={template.label}
      description={template.description}
    />
  );
}
