/** What `pickTokenFile` asks for: the dialog's title and the kinds of files it offers. */
export interface TokenFilePick {
  title: string;
  filters: { name: string; extensions: string[] }[];
}
