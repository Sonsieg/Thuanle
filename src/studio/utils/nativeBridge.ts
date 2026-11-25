import type { StudioBridge } from '../types';

let bridge: StudioBridge | null = null;
export function configureNativeBridge(value: StudioBridge | null) { bridge = value; }
export function getNativeBridge() { return bridge; }

/** Chunk large WAV exports to keep bridge messages and memory bounded. */
export async function downloadOrShare(blob: Blob, filename: string): Promise<void> {
  if (!bridge) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return;
  }
  const target = bridge;
  const id = await target.beginExport(filename, blob.type);
  try {
    for (let offset = 0; offset < blob.size; offset += 192 * 1024) {
      const chunk = blob.slice(offset, offset + 192 * 1024);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(chunk);
      });
      await target.writeExportChunk(id, base64);
    }
    await target.finishExport(id);
  } catch (error) {
    await target.cancelExport(id).catch(() => {});
    throw error;
  }
}
