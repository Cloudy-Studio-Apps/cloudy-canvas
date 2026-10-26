import type { FigColor, FigGuid } from "./fig-node.types";

/**
 * A variable's value as the file stores it: `dataType` says which field is set (`COLOR`,
 * `FLOAT`, `STRING`, `BOOLEAN`, `ALIAS` for another variable, or `EXPRESSION`).
 */
export interface FigVariableData {
  value?: {
    colorValue?: FigColor;
    floatValue?: number;
    textValue?: string;
    boolValue?: boolean;
    alias?: { guid?: FigGuid; assetRef?: { key?: string } };
    expressionValue?: FigExpression;
  };
  dataType?: string;
  resolvedDataType?: string;
}

/** A worked-out value: a function (`ADDITION`, `MULTIPLY`, `NEGATE`…) of other values. */
export interface FigExpression {
  expressionFunction?: string;
  expressionArguments?: FigVariableData[];
}

/** A layer's field bound to a variable (`variableField`: `STACK_SPACING`, `OPACITY`…). */
export interface FigConsumption {
  variableData?: FigVariableData;
  variableField?: string;
}

/** The fields of `VARIABLE_SET` (a collection) and `VARIABLE` nodes the importer reads. */
export interface FigVariableFields {
  /** A collection's modes, in order. */
  variableSetModes?: { id?: FigGuid; name?: string; sortPosition?: string }[];
  /** A variable's collection. */
  variableSetID?: { guid?: FigGuid };
  /** `COLOR`, `FLOAT`, `STRING` or `BOOLEAN`. */
  variableResolvedType?: string;
  /** Its value in each mode of its collection. */
  variableDataValues?: { entries?: { modeID?: FigGuid; variableData?: FigVariableData }[] };
  variableScopes?: string[];
  /** Its name in code, per platform (`WEB`, `iOS`, `ANDROID`). */
  codeSyntax?: { entries?: { platform?: string; value?: string }[] };
  description?: string;
  isHiddenFromPublishing?: boolean;
  /** Its place among its siblings (a variable among its collection's). */
  sortPosition?: string;
  /** The mode a frame or page picks for a collection's variables (Figma's explicit modes). */
  variableModeBySetMap?: {
    entries?: { variableSetID?: { guid?: FigGuid }; variableModeID?: FigGuid }[];
  };
  /** A layer's fields bound to variables. */
  variableConsumptionMap?: { entries?: FigConsumption[] };
}
