import test from 'node:test';
import assert from 'node:assert/strict';
import {startBatchJob} from './src/batch-job.mjs';

class FakeWorker extends EventTarget {
  sent=[]; terminated=false;
  postMessage(data){this.sent.push(data);}
  terminate(){this.terminated=true;}
  emit(data){this.dispatchEvent(new MessageEvent('message',{data}));}
}
const selection={faces:['classic'],sizes:['small']};

test('native batches leave designer messages alone and receive only their own result',async()=>{
  const worker=new FakeWorker(),progress=[],preview=[];
  worker.addEventListener('message',e=>{if(e.data.id)preview.push(e.data);});
  const job=startBatchJob(worker,selection,{shared:true,runId:9,onProgress:p=>progress.push(p)});
  assert.deepEqual(worker.sent,[{type:'batch',runId:9,selection}]);
  worker.emit({id:4,body:'preview'});
  worker.emit({type:'batch-ready',runId:8,data:'old batch'});
  worker.emit({type:'batch-progress',runId:9,completed:1,total:1});
  const bytes=new Uint8Array([80,75,1]);
  worker.emit({type:'batch-ready',runId:9,data:bytes,total:1});
  assert.equal((await job.done).data,bytes);
  assert.equal(progress.length,1);assert.equal(preview.length,1);
  assert.equal(worker.terminated,false);
  worker.emit({type:'batch-progress',runId:9,completed:2});
  assert.equal(progress.length,1,'completed jobs detach their listeners');
});

test('native cancellation waits for acknowledgment and leaves the worker usable for another batch',async()=>{
  const worker=new FakeWorker();
  const job=startBatchJob(worker,selection,{shared:true,runId:1});
  const rejected=assert.rejects(job.done,{name:'AbortError'});
  job.cancel();assert.deepEqual(worker.sent.at(-1),{type:'batch-cancel',runId:1});
  assert.equal(worker.terminated,false);
  worker.emit({type:'batch-cancelled',runId:1});await rejected;
  const next=startBatchJob(worker,selection,{shared:true,runId:2});
  worker.emit({type:'batch-cancelled',runId:1});
  worker.emit({type:'batch-ready',runId:2,data:new Uint8Array([80,75]),total:1});
  assert.equal((await next.done).total,1);assert.equal(worker.terminated,false);
});

test('web cancellation and completion release the dedicated worker',async()=>{
  const cancelledWorker=new FakeWorker(),cancelled=startBatchJob(cancelledWorker,selection);
  const rejected=assert.rejects(cancelled.done,{name:'AbortError'});
  cancelled.cancel();await rejected;assert.equal(cancelledWorker.terminated,true);
  const worker=new FakeWorker(),job=startBatchJob(worker,selection);
  assert.deepEqual(worker.sent,[{selection}]);
  worker.emit({type:'ready',data:new Uint8Array([80,75]),total:1});await job.done;
  assert.equal(worker.terminated,true);
});

test('worker failures reject a native job and detach its progress listener',async()=>{
  const worker=new FakeWorker(),progress=[];
  const job=startBatchJob(worker,selection,{shared:true,runId:1,onProgress:p=>progress.push(p)});
  const rejected=assert.rejects(job.done,{name:'WorkerError'});
  worker.dispatchEvent(new Event('error'));await rejected;
  worker.emit({type:'batch-progress',runId:1,completed:1});assert.equal(progress.length,0);
});
