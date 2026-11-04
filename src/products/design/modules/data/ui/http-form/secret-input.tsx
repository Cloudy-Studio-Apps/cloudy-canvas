import { Field, Input } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import type { SecretInputProps } from "./secret-input.types";

/** A key or password typed in the dialog: never shown back; one this device keeps says so. */
export function SecretInput({ label, value, stored, placeholder, onChange }: SecretInputProps) {
  return (
    <Field label={label}>
      {(id) => (
        <Input
          id={id}
          type="password"
          autoComplete="off"
          value={value}
          placeholder={stored ? t("source.secretStored") : placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 text-xs"
        />
      )}
    </Field>
  );
}
