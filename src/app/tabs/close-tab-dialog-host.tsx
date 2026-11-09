import { useSyncExternalStore } from "react";

import { CloseTabDialog } from "@canvas-ui/file/close-dialog";
import { closeTabPrompt } from "./close-tab-prompt";

/** Shows the question `closeTab` asks before a tab with changes nothing will save closes. */
export function CloseTabDialogHost() {
  const { question } = useSyncExternalStore(closeTabPrompt.subscribe, closeTabPrompt.get);
  return (
    <CloseTabDialog
      open={question !== null}
      name={question?.name ?? ""}
      busy={question?.busy ?? false}
      onChoose={(choice) => question?.choose(choice)}
    />
  );
}
