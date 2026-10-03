import {Capacitor} from '@capacitor/core';
import {Filesystem, Directory} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
import {createFileExporter, blobToBase64} from './file-export.mjs';

export const nativeIOS = Capacitor.getPlatform() === 'ios';

function webDownload(data, name, type) {
  const url = URL.createObjectURL(new Blob([data], {type}));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export const saveExport = createFileExporter({
  isNative: () => nativeIOS,
  filesystem: Filesystem, share: Share, documentsDirectory: Directory.Documents,
  webDownload, toBase64: blobToBase64,
  makeId: () => new Date().toISOString().replace(/[:.]/g, '-') + '-' + crypto.randomUUID().slice(0, 8)
});
