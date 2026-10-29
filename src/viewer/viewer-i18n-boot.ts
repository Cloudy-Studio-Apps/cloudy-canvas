// The first import of main.tsx: sets the locale before any other module runs, so `t()` in
// top-level constants reads it. The export writes the app's locale as `<html lang>`.
import { DEFAULT_LOCALE, isLocale, setLocale } from "@shared/core";

const lang = document.documentElement.lang;
setLocale(isLocale(lang) ? lang : DEFAULT_LOCALE);
