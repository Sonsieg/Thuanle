export type StudioTab = 'drafts' | 'lyrics' | 'groove' | 'melody' | 'piano';

/** Only serializable data crosses the Expo DOM bridge. */
export interface StudioBridge {
  loadDrafts: () => Promise<string | null>;
  saveDraft: (draft: string) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  requestMicrophone: () => Promise<boolean>;
  beginExport: (filename: string, mimeType: string) => Promise<string>;
  writeExportChunk: (id: string, base64: string) => Promise<void>;
  finishExport: (id: string) => Promise<void>;
  cancelExport: (id: string) => Promise<void>;
}
