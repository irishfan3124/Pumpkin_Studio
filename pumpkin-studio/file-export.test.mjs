import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFileExporter} from './src/file-export.mjs';

function setup({native = true, writeError, shareError} = {}) {
  const calls = [];
  const exportFile = createFileExporter({
    isNative: () => native, documentsDirectory: 'DOCUMENTS', makeId: () => 'export-1',
    toBase64: async bytes => Buffer.from(bytes).toString('base64'),
    filesystem: {async writeFile(options) {
      calls.push(['write', options]);
      if (writeError) throw writeError;
      return {uri: 'file:///Documents/' + options.path};
    }},
    share: {async share(options) {calls.push(['share', options]); if (shareError) throw shareError;}},
    webDownload: (...args) => calls.push(['download', ...args])
  });
  return {exportFile, calls};
}

test('web exports keep the browser download and never invoke a native plugin', async () => {
  const {exportFile, calls} = setup({native: false});
  const bytes = new Uint8Array([0, 255, 16]);
  assert.deepEqual(await exportFile(bytes, 'pumpkin-body.stl', 'model/stl'), {destination: 'download'});
  assert.deepEqual(calls, [['download', bytes, 'pumpkin-body.stl', 'model/stl']]);
});

test('iOS preserves binary bytes in Documents and shares the written file URI', async () => {
  const {exportFile, calls} = setup();
  const bytes = new Uint8Array([0, 255, 128, 1, 42]);
  const result = await exportFile(bytes, 'pumpkin-studio-STL.zip', 'application/zip');
  assert.equal(result.shared, true);
  assert.equal(result.path, 'Exports/export-1/pumpkin-studio-STL.zip');
  const [write, share] = calls;
  assert.equal(write[0], 'write');
  assert.deepEqual(Buffer.from(write[1].data, 'base64'), Buffer.from(bytes));
  assert.equal(write[1].directory, 'DOCUMENTS');
  assert.equal(write[1].recursive, true);
  assert.equal(write[1].encoding, undefined);
  assert.deepEqual(share, ['share', {
    title: 'pumpkin-studio-STL.zip', files: ['file:///Documents/' + result.path]
  }]);
});

test('cancelled sharing still reports the saved file', async () => {
  const {exportFile, calls} = setup({shareError: new Error('Share canceled')});
  const result = await exportFile(new Uint8Array([1]), 'pumpkin-lid.stl', 'model/stl');
  assert.equal(result.destination, 'files');
  assert.equal(result.shared, false);
  assert.equal(result.shareError, undefined);
  assert.equal(calls.length, 2);
});

test('share failure retains the saved export and distinguishes the failure', async () => {
  const {exportFile} = setup({shareError: new Error('Error sharing item')});
  assert.equal((await exportFile(new Uint8Array([1]), 'pumpkin-stem.stl', 'model/stl')).shareError, true);
});

test('a disk write failure does not present the share sheet', async () => {
  const {exportFile, calls} = setup({writeError: new Error('No disk space')});
  await assert.rejects(exportFile(new Uint8Array([1]), 'pumpkin-lid.stl', 'model/stl'), /No disk space/);
  assert.equal(calls.length, 1);
});
