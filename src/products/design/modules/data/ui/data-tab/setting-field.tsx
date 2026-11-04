import { CommitInput, CommitTextarea } from "@canvas-ui";
import { Field, NumberInput, SelectField, SwitchField } from "@shared/ui/kit";
import { filePathKey } from "../../update";
import { FileField } from "./file-field";
import { PairsField } from "./pairs-field";
import { SecretField } from "./secret-field";
import type { SettingFieldProps } from "./setting-field.types";

const text = (value: unknown): string => (typeof value === "string" ? value : "");

/** One setting of a source type or format, drawn from its spec; text commits on Enter or blur. */
export function SettingField({ spec, value, stored, onChange, onFilePicked }: SettingFieldProps) {
  switch (spec.kind) {
    case "text":
    case "url":
      return (
        <Field label={spec.label}>
          {(id) => (
            <CommitInput
              id={id}
              type={spec.kind === "url" ? "url" : "text"}
              value={text(value)}
              placeholder={spec.placeholder}
              onCommit={(next) => onChange(next.trim())}
              className="h-7 text-xs"
            />
          )}
        </Field>
      );
    case "multiline":
      return (
        <Field label={spec.label}>
          {(id) => (
            <CommitTextarea
              id={id}
              value={text(value)}
              placeholder={spec.placeholder}
              onCommit={onChange}
              className="min-h-16 font-mono text-xs"
            />
          )}
        </Field>
      );
    case "number":
      return (
        <Field label={spec.label}>
          <NumberInput
            label={spec.label}
            value={typeof value === "number" ? value : (spec.min ?? 0)}
            min={spec.min}
            max={spec.max}
            decimals={0}
            onChange={(next, info) => {
              if (info.done) onChange(next);
            }}
          />
        </Field>
      );
    case "boolean":
      return (
        <SwitchField
          label={spec.label}
          checked={typeof value === "boolean" ? value : (spec.default ?? false)}
          onChange={onChange}
        />
      );
    case "select":
      return (
        <SelectField
          layout="stacked"
          label={spec.label}
          value={text(value) || (spec.options[0]?.value ?? "")}
          options={spec.options}
          onChange={onChange}
        />
      );
    case "pairs":
      return <PairsField spec={spec} value={value} stored={stored} onChange={onChange} />;
    case "file":
    case "folder":
      return (
        <FileField
          spec={spec}
          value={text(value)}
          onDevice={stored.has(filePathKey(spec.key))}
          onChange={onChange}
          onFilePicked={onFilePicked}
        />
      );
    case "secret":
      return (
        <SecretField
          spec={spec}
          stored={stored.has(spec.key)}
          pending={typeof value === "string" && value !== ""}
          onChange={onChange}
        />
      );
  }
}
