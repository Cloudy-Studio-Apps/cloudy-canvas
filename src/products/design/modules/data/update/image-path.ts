import { isAbsolutePath } from "../settings";

/**
 * Where an image file named by the data is, inside the chosen folder only: `null` for an absolute
 * path, a drive (`C:`), or any `..` step, so data can't reach a file elsewhere on the device.
 * Subfolders (`shoes/red.png`) are allowed and joined with the folder's own separator.
 */
export function imagePathIn(folder: string, name: string): string | null {
  const text = name.trim();
  if (!text || isAbsolutePath(text) || text.includes(":")) return null;
  const steps = text.split(/[\\/]/).filter((step) => step !== "" && step !== ".");
  if (steps.length === 0 || steps.some((step) => step === "..")) return null;
  const separator = folder.includes("\\") && !folder.includes("/") ? "\\" : "/";
  const base = folder.replace(/[\\/]+$/, "");
  return [base, ...steps].join(separator);
}
