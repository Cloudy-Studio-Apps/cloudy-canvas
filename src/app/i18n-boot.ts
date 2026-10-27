// The first import of main.tsx: sets the locale before any other module runs, so `t()` in
// top-level constants (a module's command labels) already reads it. Import nothing else here.
import { getLocale, resolveLocale, setLocale } from "@shared/core";
import { useLocaleStore } from "@shared/stores/locale-store";

setLocale(resolveLocale(useLocaleStore.getState().preference, navigator.languages));
document.documentElement.lang = getLocale();
