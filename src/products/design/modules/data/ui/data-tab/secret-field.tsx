import { useState } from "react";
import { X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { Field, IconButton } from "@shared/ui/kit";
import type { SecretFieldProps } from "./secret-field.types";
import { t } from "../../data.i18n";

/**
 * A secret (an API key): never shown, only replaced. Empty, it says whether this device has one;
 * a typed value is saved on the device when it commits, and × forgets the saved one.
 */
export function SecretField({ spec, stored, onChange }: SecretFieldProps) {
  // A new key per commit empties the field again: the value is never shown back.
  const [round, setRound] = useState(0);
  return (
    <Field label={spec.label}>
      {(id) => (
        <div className="flex items-center gap-1">
          <CommitInput
            key={round}
            id={id}
            type="password"
            autoComplete="off"
            value=""
            placeholder={stored ? t("source.secretStored") : t("source.secretEmpty")}
            onCommit={(next) => {
              if (next !== "") onChange(next);
              setRound((n) => n + 1);
            }}
            className="h-7 flex-1 text-xs"
          />
          {stored && (
            <IconButton size="xs" label={t("source.secretForget")} onClick={() => onChange(null)}>
              <X />
            </IconButton>
          )}
        </div>
      )}
    </Field>
  );
}
