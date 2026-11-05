import { REPEAT_ERRORS } from "../../repeat";
import { readAnsweredMessage, readNoSourceType, UPDATE_ERRORS } from "../../update";
import { readPagingMessage } from "../../sources";
import { readShapeError, SHAPE_ERRORS } from "../../table";
import { t } from "../../data.i18n";

/**
 * An engine message as the user reads it: the ones an Update is known to fail with translated
 * (`UPDATE_ERRORS`, a link's HTTP error, a type that isn't installed, reading pages' messages;
 * several joined by a line break are each translated), a shape's refusals (`SHAPE_ERRORS`, `readShapeError`)
 * and `REPEAT_ERRORS`, any other one as it is.
 */
export function errorText(message: string): string {
  if (message.startsWith(UPDATE_ERRORS.missing)) {
    return t("errors.missing", { keys: message.slice(UPDATE_ERRORS.missing.length) });
  }
  if (message.startsWith(UPDATE_ERRORS.noList)) {
    return t("errors.noList", { path: message.slice(UPDATE_ERRORS.noList.length) });
  }
  const answered = readAnsweredMessage(message);
  if (answered) return t("errors.answered", answered);
  const noType = readNoSourceType(message);
  if (noType !== null) return t("errors.noSourceType", { type: noType });
  if (message.includes("\n")) return message.split("\n").map(errorText).join(" ");
  const paging = readPagingMessage(message);
  if (paging) {
    const values = { ...paging.values };
    if (values.message !== undefined) values.message = errorText(values.message);
    return t(`paging.${paging.key}`, values);
  }
  const shape = readShapeError(message);
  if (shape) {
    return shape.kind === "collision"
      ? t("errors.shapeCollision", { name: shape.name })
      : t("errors.shapeGroup", { name: shape.name });
  }
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
    case SHAPE_ERRORS.unreadable:
      return t("errors.shapeUnreadable");
    case SHAPE_ERRORS.changed:
      return t("errors.shapeChanged");
    case REPEAT_ERRORS.noLayer:
      return t("errors.noLayer");
    case REPEAT_ERRORS.noParentFrame:
      return t("errors.noParentFrame");
    default:
      return message;
  }
}

/** An error for `notifyError` with its message as `errorText` gives it. */
export function translatedError(error: unknown): unknown {
  return error instanceof Error ? new Error(errorText(error.message)) : error;
}
