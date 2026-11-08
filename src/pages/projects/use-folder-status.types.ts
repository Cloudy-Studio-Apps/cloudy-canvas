/**
 * What a folder chosen for a new project is: missing (it's created), there already (its files
 * become the project's) or a project already (refused).
 */
export type FolderStatus = "new" | "existing" | "project";
