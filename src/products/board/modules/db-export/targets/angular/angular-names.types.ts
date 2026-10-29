/** The exported tables' and enums' TypeScript names and files (without `.ts`). */
export interface AngularNames {
  model(table: string): string;
  enumType(name: string): string;
  modelFile(table: string): string;
  enumFile(name: string): string;
}
