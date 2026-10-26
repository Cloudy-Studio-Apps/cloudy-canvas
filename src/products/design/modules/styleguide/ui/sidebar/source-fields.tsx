import {
  Field,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/kit";
import { useStyleguide } from "../hooks/use-styleguide";
import type { SourceFieldsProps } from "./sheet-section.types";

/** The value the group select shows for "the whole category". */
const WHOLE = "__whole__";

/** What a live element shows: a category, and all of it or one group. */
export function SourceFields({ sheet, outline }: SourceFieldsProps) {
  const { styleguide } = useStyleguide();
  const entry = outline.find((item) => item.category.id === sheet.sheet.category);
  return (
    <div className="flex flex-col gap-2">
      <Field label="Category" layout="inline">
        <Select
          value={sheet.sheet.category}
          onValueChange={(category) =>
            // Another category: its own default template, all of it.
            styleguide.setSheet(sheet.id, {
              category,
              group: undefined,
              template: null,
              options: null,
            })
          }
        >
          <SelectTrigger aria-label="Category" className="h-7 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {outline.map((item) => (
              <SelectItem key={item.category.id} value={item.category.id}>
                {item.category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {entry && entry.groups.length > 1 && (
        <Field label="Group" layout="inline">
          <Select
            value={sheet.sheet.group ?? WHOLE}
            onValueChange={(group) =>
              styleguide.setSheet(sheet.id, { group: group === WHOLE ? undefined : group })
            }
          >
            <SelectTrigger aria-label="Group" className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={WHOLE}>Whole category</SelectItem>
              {entry.groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.title || entry.category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    </div>
  );
}
