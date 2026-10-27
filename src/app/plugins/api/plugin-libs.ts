// `api.libs`: the app's own copies of the libraries plugins need, since a plugin can't import npm
// packages and must share the app's React. Feature-only libraries aren't here: a plugin bundles
// its own.
import * as React from "react";

export { React };
export { createPortal } from "react-dom";
export * as icons from "lucide-react";
export { create as createStore } from "zustand";
export { persist } from "zustand/middleware";
export { StreamLanguage } from "@codemirror/language";
