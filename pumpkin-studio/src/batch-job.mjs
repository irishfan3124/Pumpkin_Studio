// Native batches share the designer's bundled WASM worker. Web batches own a
// separate worker that cancellation can terminate without affecting the preview.
export function startBatchJob(worker, selection, {shared = false, runId, onProgress = () => {}} = {}) {
  let settled = false, resolve, reject;
  const done = new Promise((yes, no) => {resolve = yes; reject = no;});
  const finish = (error, result) => {
    if (settled) return;
    settled = true;
    worker.removeEventListener('message', message);
    worker.removeEventListener('error', failure);
    if (!shared) worker.terminate();
    error ? reject(error) : resolve(result);
  };
  const message = ({data}) => {
    if (shared && (data.runId !== runId || !data.type?.startsWith('batch-'))) return;
    switch (data.type?.replace(/^batch-/, '')) {
      case 'progress': onProgress(data); break;
      case 'ready': finish(null, data); break;
      case 'cancelled': finish(new DOMException('Batch cancelled.', 'AbortError')); break;
      case 'error': finish(new Error(data.error)); break;
    }
  };
  const failure = () => {
    const error = new Error('The batch could not finish. Try fewer faces or sizes, or reopen the app.');
    error.name = 'WorkerError';
    finish(error);
  };
  worker.addEventListener('message', message);
  worker.addEventListener('error', failure);
  try {worker.postMessage(shared ? {type: 'batch', runId, selection} : {selection});}
  catch (error) {finish(error);}
  return {done,cancel() {
    if (settled) return;
    if (shared) worker.postMessage({type: 'batch-cancel', runId});
    else finish(new DOMException('Batch cancelled.', 'AbortError'));
  }};
}
