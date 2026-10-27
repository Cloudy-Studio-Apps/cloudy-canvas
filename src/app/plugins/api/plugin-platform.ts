// `api.platform`: the part of the platform a plugin may use. Curated, since these touch the
// user's computer: saving and opening files, images, local files, HTTP, links, the clipboard and
// fonts.
export {
  clipboard,
  exportFile,
  fontLibrary,
  http,
  openExternal,
  openFile,
  pickImageFiles,
  readLocalFile,
} from "@platform";
