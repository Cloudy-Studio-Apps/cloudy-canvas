import { notifyError } from "@shared/stores/toast-store";
import { errorText, translatedError } from "../data-tab/error-text";
import { t } from "../../data.i18n";

/** Runs a repeat edit; a refusal is reported (translated when known) and its text returned. */
export function runRepeat(edit: () => void): string | null {
  try {
    edit();
    return null;
  } catch (error) {
    notifyError(t("repeat.failed"), translatedError(error));
    return error instanceof Error ? errorText(error.message) : String(error);
  }
}
