import { DOCUMENT_TOKENS, type VariableType } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { FIRST_COLLECTION, NEW_NAMES, NEW_VALUES } from "./scope-options";

/**
 * Adds a variable of a type in a collection (the first, or a new "Primitives" when the file has
 * none) and group, named after its type; returns its id, or `null` when it failed (toasted).
 */
export function useCreateVariable(): (
  type: VariableType,
  collectionId?: string,
  group?: string,
) => string | null {
  const engine = useDesignEngine();
  return (type, collectionId, group) => {
    try {
      const tokens = engine.service(DOCUMENT_TOKENS);
      const target =
        collectionId ??
        tokens.store().collections()[0]?.id ??
        tokens.createCollection(FIRST_COLLECTION).id;
      const name = NEW_NAMES[type];
      return tokens.createVariable({
        collectionId: target,
        name: group ? `${group}/${name}` : name,
        type,
        value: NEW_VALUES[type],
      }).id;
    } catch (error) {
      notifyError("Couldn't add the variable", error);
      return null;
    }
  };
}
