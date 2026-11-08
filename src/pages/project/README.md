# Project page

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

- **`/project/:id` (`project-page.tsx`):** a placeholder for a project's home: a back button to `/projects` and the project's name, read from `useProjectsStore`. The project's files, libraries and trash come later. The route redirects Home where projects don't exist (Android, the browser build).

Its strings are `t` from `project.i18n.ts` (`locales/`).
