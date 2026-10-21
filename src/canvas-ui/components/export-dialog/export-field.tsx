import type { ExportFieldProps } from "./export-dialog.types";

/** One row of the export dialog: its label on the left, its control on the right. */
export function ExportField({ label, id, children }: ExportFieldProps) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-3">
      <label htmlFor={id} className="pt-1.5 text-sm text-muted-foreground">
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}
