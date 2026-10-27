# Settings

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

## Settings

- **Settings (`/settings`, `pages/settings/`):** opened from Home's top bar or Ctrl+,. Each section is its own page at `/settings/<id>` (`/settings` shows the first, an unknown id goes back to it), picked from the grouped left nav (`SettingsNav`; a scrolling row in a narrow window); the list is data, `SETTINGS_SECTIONS` and `SETTINGS_GROUPS` (`settings-sections.ts`), and each page is a `SettingsSection` (title, description, a card). It has About (version from `appInfo()` in `@platform`, `__APP_VERSION__` outside Tauri; the DarkRedgm link opens through `openExternal`, whose URLs are allowed in the capabilities), the Cloudy Studio dedication card (`dedication-card.tsx`), the agents panel (`AgentServerPanel` in `@shared/agent-server`), files & storage, and the board's shortcuts (`BoardShortcutsList` from `@board/ui`, read from the board's modules: toolbar entries, host command labels and the composed keybindings).
- **Language** (`sections/language-section.tsx`): System (the OS language, named in the option), English or Español, saved in `useLocaleStore`. The locale is set once at boot, so a choice different from the shown language offers Restart now (`appLifecycle.runQuitTasks`, then a window reload) or applies on the next launch. The settings pages' strings are `t` from `settings.i18n.ts` (`locales/`).
