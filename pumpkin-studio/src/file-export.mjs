// The iOS share sheet needs a real file URL, not a browser blob download.
export function createFileExporter({isNative, filesystem, share, documentsDirectory, webDownload, toBase64, makeId}) {
  return async function exportFile(data, name, type) {
    if (!isNative()) {
      webDownload(data, name, type);
      return {destination: 'download'};
    }
    const path = `Exports/${makeId()}/${name}`;
    const {uri} = await filesystem.writeFile({
      path, data: await toBase64(data, type),
      directory: documentsDirectory, recursive: true
    });
    // Keep the export in Documents even if sharing is cancelled. Files exposes
    // this directory, and another app may read the URL after the sheet closes.
    try {
      await share.share({title: name, files: [uri]});
      return {destination: 'files', path, shared: true};
    } catch (error) {
      if (/^Share cancel(?:ed|led)$/i.test(error?.message || '')) {
        return {destination: 'files', path, shared: false};
      }
      // A failed share must not obscure the successfully saved file.
      return {destination: 'files', path, shared: false, shareError: true};
    }
  };
}

export function blobToBase64(data, type) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.slice(reader.result.indexOf(',') + 1));
    reader.onerror = () => reject(reader.error || new Error('Could not prepare the export.'));
    reader.readAsDataURL(new Blob([data], {type}));
  });
}
