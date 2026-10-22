// Pages: the page records, the canvas's scopes (one page on screen at a time), the pages service
// that edits them and the migration that gives older designs "Page 1".
export * from "./page";
export { DESIGN_PAGES, DesignPages } from "./design-pages";
export { ensurePages } from "./ensure-pages";
export { PAGE_SCOPES } from "./page-scopes";
export { pagesOf } from "./pages-of";
export { pagesTools } from "./pages.agent-tools";
