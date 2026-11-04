import { REPEAT_ERRORS } from "../../repeat";
import { readAnsweredMessage, UPDATE_ERRORS } from "../../update";
import { t } from "../../data.i18n";

/**
 * An engine message as the user reads it: the ones an Update is known to fail with translated
 * (`UPDATE_ERRORS`, a link's HTTP error) and `REPEAT_ERRORS`, any other one as it is.
 */
export function errorText(message: string): string {
  if (message.startsWith(UPDATE_ERRORS.missing)) {
    return t("errors.missing", { keys: message.slice(UPDATE_ERRORS.missing.length) });
  }
  const answered = readAnsweredMessage(message);
  if (answered) return t("errors.answered", answered);
  switch (message) {
    case UPDATE_ERRORS.noFormat:
      return t("errors.noFormat");
    case UPDATE_ERRORS.pickFileAgain:
      return t("errors.pickFileAgain");
    case UPDATE_ERRORS.privateFile:
      return t("errors.privateFile");
    case UPDATE_ERRORS.privateFolder:
      return t("errors.privateFolder");
    case UPDATE_ERRORS.webPage:
      return t("errors.webPage");
    case REPEAT_ERRORS.noLayer:
      return t("errors.noLayer");
    default:
      return message;
  }
}

/** An error for `notifyError` with its message as `errorText` gives it. */
export function translatedError(error: unknown): unknown {
  return error instanceof Error ? new Error(errorText(error.message)) : error;
}
