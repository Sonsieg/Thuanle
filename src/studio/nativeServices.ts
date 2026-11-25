import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { Alert } from 'react-native';
import type { SketchpadDraft } from './utils/lyricGrooveEngine';
import type { StudioBridge } from './types';

let storageQueue: Promise<unknown> = Promise.resolve();
function serialize<T>(work: () => Promise<T>): Promise<T> {
  const result = storageQueue.then(work);
  storageQueue = result.catch(() => {});
  return result;
}
const draftsFile = () => new File(Paths.document, 'lyric-groove-drafts-v1.json');
async function readDrafts(): Promise<SketchpadDraft[] | null> {
  const file = draftsFile();
  if (!file.exists) return null;
  const parsed: unknown = JSON.parse(await file.text());
  if (!Array.isArray(parsed) || !parsed.every((d) => d && typeof d.id === 'string' && Array.isArray(d.sections) && d.sections.length > 0 && Array.isArray(d.melodyNotes))) {
    throw new Error('Dữ liệu bản nháp không hợp lệ');
  }
  return parsed;
}
async function writeDrafts(drafts: SketchpadDraft[]) {
  const temporary = new File(Paths.document, 'lyric-groove-drafts.pending.json');
  await temporary.write(JSON.stringify(drafts));
  await temporary.move(draftsFile(), { overwrite: true });
}
const exportsInProgress = new Map<string, { file: File; mimeType: string }>();
function getExport(id: string) {
  const entry = exportsInProgress.get(id);
  if (!entry) throw new Error('Phiên xuất file không tồn tại');
  return entry;
}

export const nativeStudioServices: StudioBridge = {
  loadDrafts: () => serialize(async () => {
    const drafts = await readDrafts();
    return drafts === null ? null : JSON.stringify(drafts.sort((a, b) => b.updatedAt - a.updatedAt));
  }),
  saveDraft: (raw) => serialize(async () => {
    const draft = JSON.parse(raw) as SketchpadDraft;
    const current = await readDrafts() ?? [];
    await writeDrafts([draft, ...current.filter((d) => d.id !== draft.id)]);
  }),
  deleteDraft: (id) => serialize(async () => {
    await writeDrafts((await readDrafts() ?? []).filter((d) => d.id !== id));
  }),
  requestMicrophone: async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (permission.granted) await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    return permission.granted;
  },
  beginExport: async (filename, mimeType) => {
    const directory = new Directory(Paths.document, 'Exports');
    directory.create({ idempotent: true, intermediates: true });
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const file = new File(directory, `${id}-${safeName}`);
    file.create();
    exportsInProgress.set(id, { file, mimeType });
    return id;
  },
  writeExportChunk: async (id, base64) => {
    await getExport(id).file.write(base64, { encoding: 'base64', append: true });
  },
  finishExport: async (id) => {
    const { file, mimeType } = getExport(id);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: 'Chia sẻ bản nhạc' });
    } else {
      Alert.alert('Đã lưu file', `File đã lưu trong Documents/Exports: ${file.name}`);
    }
    exportsInProgress.delete(id);
  },
  cancelExport: async (id) => {
    const item = exportsInProgress.get(id);
    if (item?.file.exists) item.file.delete();
    exportsInProgress.delete(id);
  },
};
