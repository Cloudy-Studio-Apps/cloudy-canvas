import type { FileInfo, Storage } from "@core";

// TODO: Implement with the Tauri fs plugin once real file saving/loading lands.
export class TauriStorage implements Storage {
  async list(): Promise<FileInfo[]> {
    return [];
  }

  async load(id: string): Promise<Uint8Array> {
    throw new Error(`TauriStorage.load is not implemented yet (id: ${id})`);
  }

  async save(id: string, _data: Uint8Array): Promise<void> {
    throw new Error(`TauriStorage.save is not implemented yet (id: ${id})`);
  }
}
