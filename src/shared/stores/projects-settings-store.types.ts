export interface ProjectsSettingsState {
  /** Where new projects go; null is the default (`Cloudy Canvas` in the documents folder). */
  projectsFolder: string | null;
  setProjectsFolder: (folder: string | null) => void;
}
