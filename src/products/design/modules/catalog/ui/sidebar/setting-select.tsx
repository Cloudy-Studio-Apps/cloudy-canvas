import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/ui/select";
import type { SettingSelectProps } from "./sidebar.types";

/** A compact select for one of the brochure's settings. */
export function SettingSelect<T extends string>({
  label,
  value,
  choices,
  onChange,
}: SettingSelectProps<T>) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const choice = choices.find((item) => item.value === next);
        if (choice) onChange(choice.value);
      }}
    >
      <SelectTrigger aria-label={label} title={label} className="h-7 w-full text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {choices.map((choice) => (
          <SelectItem key={choice.value} value={choice.value}>
            {choice.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
