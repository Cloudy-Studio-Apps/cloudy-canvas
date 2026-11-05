import { useUpdateSource } from "../hooks/use-update-source";
import type { SourceUpdateButtonProps } from "./source-update-button.types";
import { UpdateButton } from "./update-button";

/** Update for one source, wired to its running Update. */
export function SourceUpdateButton({ sourceId, disabled }: SourceUpdateButtonProps) {
  const update = useUpdateSource(sourceId);
  return (
    <UpdateButton
      stage={update.stage}
      progress={update.progress}
      cancellable={update.cancellable}
      onRun={update.run}
      onCancel={update.cancel}
      disabled={disabled}
    />
  );
}
