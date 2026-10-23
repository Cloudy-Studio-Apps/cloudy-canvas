import type { ErIssue } from "../../model/check/check-er.types";
import type { ErShapes } from "../../model/lang";
import type { ErNotationSettings, ErStandard } from "../er.types";

/**
 * A standard a diagram can follow (a textbook or paper): where it comes from, how it draws, what
 * it has, and its own rules. Every standard, built-in or a plugin's, is one of these, written with
 * `defineErStandard` and contributed to the board's `erStandards` point; nothing else names one.
 */
export interface ErStandardDefinition {
  id: ErStandard;
  label: string;
  /** The book or paper, as cited. */
  citation: string;
  /** Where to read it (a publisher's page, a library record or the paper), or `null`. */
  url: string | null;
  /** Its drawing settings were taken from secondary sources and may differ in details. */
  approximate: boolean;
  /** What it's known for, in a sentence. */
  summary: string;
  settings: ErNotationSettings;
  /**
   * The constructs (`ErConstructDefinition` ids) it doesn't have: the editor won't add them and
   * the Check diagram reports them as errors. Unset: everything is allowed, constructs added later
   * included.
   */
  forbids?: readonly string[];
  /** Its own findings for the Check diagram, after the shared rules'. */
  check?: (shapes: ErShapes) => ErIssue[];
}
