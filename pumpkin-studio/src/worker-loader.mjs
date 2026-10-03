export async function createGeometryWorker(scriptURL, wasmURL, native, {fetch: fetchAsset = fetch, Worker: WorkerClass = Worker, url = URL} = {}) {
  if (!native) return new WorkerClass(scriptURL, {type: 'module'});
  // Load packaged assets from the main WKWebView. The worker then runs entirely
  // from a blob and in-memory WASM, without depending on custom-scheme fetches
  // from a worker's separate networking context.
  const [script, wasm] = await Promise.all([fetchAsset(scriptURL), fetchAsset(wasmURL)]);
  if (!script.ok || !wasm.ok) throw new Error('Could not load the bundled geometry engine.');
  const [source, wasmBinary] = await Promise.all([script.text(), wasm.arrayBuffer()]);
  const workerURL = url.createObjectURL(new Blob([source], {type: 'text/javascript'}));
  try {
    const worker = new WorkerClass(workerURL, {type: 'module'});
    const release = () => {
      url.revokeObjectURL(workerURL);
      worker.removeEventListener('message', release);
      worker.removeEventListener('error', release);
    };
    worker.addEventListener('message', release);
    worker.addEventListener('error', release);
    worker.postMessage({type: 'init', wasmBinary}, [wasmBinary]);
    return worker;
  } catch (error) {
    url.revokeObjectURL(workerURL);
    throw error;
  }
}
