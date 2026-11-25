import assert from 'node:assert/strict';
import test from 'node:test';
import { configureNativeBridge, downloadOrShare } from './nativeBridge.ts';

class TestFileReader {
  result: string | null = null;
  onload?: () => void;
  onerror?: () => void;
  readAsDataURL(blob: Blob) {
    void blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;
      this.onload?.();
    });
  }
}
Object.assign(globalThis, { FileReader: TestFileReader });
function createBridge() {
  const chunks: Buffer[] = [];
  const calls: string[] = [];
  const bridge = {
    loadDrafts: async () => null,
    saveDraft: async () => {},
    deleteDraft: async () => {},
    requestMicrophone: async () => true,
    beginExport: async (name: string, mime: string) => { calls.push(`${name}:${mime}`); return 'export-1'; },
    writeExportChunk: async (id: string, value: string) => {
      assert.equal(id, 'export-1');
      assert.ok(value.length <= 256 * 1024);
      chunks.push(Buffer.from(value, 'base64'));
    },
    finishExport: async () => { calls.push('finished'); },
    cancelExport: async () => { calls.push('cancelled'); },
  };
  return { bridge, chunks, calls };
}
test('large audio export preserves binary bytes across bounded bridge chunks', async () => {
  const { bridge, chunks, calls } = createBridge();
  configureNativeBridge(bridge);
  try {
    const original = Buffer.alloc(600_007);
    for (let i = 0; i < original.length; i++) original[i] = i % 251;
    await downloadOrShare(new Blob([original], { type: 'audio/wav' }), 'demo.wav');
    assert.equal(chunks.length, 4);
    assert.deepEqual(Buffer.concat(chunks), original);
    assert.deepEqual(calls, ['demo.wav:audio/wav', 'finished']);
  } finally { configureNativeBridge(null); }
});
test('failed native writes clean up incomplete exports and report the failure', async () => {
  const { bridge, calls } = createBridge();
  bridge.writeExportChunk = async () => { throw new Error('disk full'); };
  configureNativeBridge(bridge);
  try {
    await assert.rejects(downloadOrShare(new Blob(['MThd']), 'song.mid'), /disk full/);
    assert.deepEqual(calls, ['song.mid:', 'cancelled']);
  } finally { configureNativeBridge(null); }
});
