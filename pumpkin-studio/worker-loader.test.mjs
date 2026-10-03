import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGeometryWorker} from './src/worker-loader.mjs';

test('web keeps the normal module worker with no asset preloading', async () => {
  const calls=[];
  const worker=await createGeometryWorker('worker.js','manifold.wasm',false,{
    Worker: class {constructor(...args){calls.push(args);}},
    fetch:()=>{throw Error('must not fetch');}
  });
  assert.ok(worker);
  assert.deepEqual(calls,[['worker.js',{type:'module'}]]);
});

test('native worker is self contained and receives transferred WASM bytes', async () => {
  const binary=new Uint8Array([0,97,115,109]).buffer,fetches=[],listeners=new Map();
  let blob,revoked=false;
  const worker=await createGeometryWorker('capacitor://localhost/worker.js','capacitor://localhost/manifold.wasm',true,{
    fetch:async url=>{fetches.push(url);return {ok:true,text:async()=> 'self.onmessage=()=>{};',arrayBuffer:async()=>binary};},
    Worker:class {
      constructor(url,options){assert.equal(url,'blob:test');assert.equal(options.type,'module');}
      addEventListener(event,fn){listeners.set(event,fn);}
      removeEventListener(event){listeners.delete(event);}
      postMessage(message,transfers){this.message=message;this.transfers=transfers;}
    },
    url:{createObjectURL(value){blob=value;return 'blob:test';},revokeObjectURL(value){assert.equal(value,'blob:test');revoked=true;}}
  });
  assert.deepEqual(fetches,['capacitor://localhost/worker.js','capacitor://localhost/manifold.wasm']);
  assert.equal(await blob.text(),'self.onmessage=()=>{};');
  assert.equal(worker.message.type,'init');
  assert.equal(worker.message.wasmBinary,binary);
  assert.deepEqual(worker.transfers,[binary]);
  assert.equal(revoked,false);
  listeners.get('message')();
  assert.equal(revoked,true);
  assert.equal(listeners.size,0);
});

test('missing native asset fails before constructing a worker',async()=>{
  await assert.rejects(createGeometryWorker('worker.js','manifold.wasm',true,{
    fetch:async()=>({ok:false}),Worker:class{constructor(){throw Error('must not start');}}
  }),/bundled geometry engine/);
});
