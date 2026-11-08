import { openFile } from "@platform";
import { firstLibraryRecords } from "./first-library";
import type {
  FirstLibrarySource,
  PickedStyles,
  PickStylesLabels,
  StylesSource,
  StylesSourceKind,
} from "./first-library.types";

/** The library source a picked styles source stands for. */
export function librarySourceOf(styles: StylesSource): FirstLibrarySource {
  if (styles.kind === "empty") return "empty";
  return styles.kind === "file" ? { fromFile: styles.bytes } : { fromTokensJson: styles.bytes };
}

/**
 * Asks for the file a styles source reads (a design or board, or a tokens JSON) and reads it at
 * once, so one with no styles to give is flagged before anything is created. `null` when the
 * dialog was cancelled; throws when the file can't be read.
 */
export async function pickStylesSource(
  kind: Exclude<StylesSourceKind, "empty">,
  labels: PickStylesLabels,
): Promise<PickedStyles | null> {
  const picked = await openFile(
    kind === "file"
      ? {
          title: labels.pickFile,
          filters: [{ name: labels.filterDesignBoard, extensions: ["cdesign", "cboard"] }],
        }
      : {
          title: labels.pickTokens,
          filters: [{ name: labels.filterJson, extensions: ["json"] }],
        },
  );
  if (!picked) return null;
  const source: PickedStyles = { kind, name: picked.name, bytes: picked.bytes };
  firstLibraryRecords(librarySourceOf(source));
  return source;
}
