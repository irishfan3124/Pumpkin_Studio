import createManifold from 'manifold-3d';
import {buildPumpkin} from './geometry.mjs';
import {generateBatch} from './batch-core.mjs';
let ready,activeBatch=null;
function initialize(options){ready=createManifold(options).then(m=>{m.setup();return m;});ready.catch(()=>{});}
self.onmessage=async({data})=>{
 if(data.type==='init'){initialize({wasmBinary:data.wasmBinary,locateFile:()=> 'manifold.wasm'});return;}
 if(data.type==='batch-cancel'){if(activeBatch?.runId===data.runId)activeBatch.cancelled=true;return;}
 if(data.type==='batch'){
  if(activeBatch){self.postMessage({type:'batch-error',runId:data.runId,error:'A batch is already running.'});return;}
  const job=activeBatch={runId:data.runId,cancelled:false};
  try{
   if(!ready)initialize({locateFile:()=>new URL('./manifold.wasm',import.meta.url).href});
   const lib=await ready;
   const result=await generateBatch(data.selection,{build:(params,contours)=>buildPumpkin(lib,params,contours),shouldCancel:()=>job.cancelled,onProgress:progress=>self.postMessage({type:'batch-progress',runId:job.runId,...progress})});
   self.postMessage({type:'batch-ready',runId:job.runId,...result},[result.data.buffer]);
  }catch(e){self.postMessage({type:e.name==='AbortError'?'batch-cancelled':'batch-error',runId:job.runId,error:e.message||String(e)});}
  finally{activeBatch=null;}
  return;
 }
 try{if(!ready)initialize({locateFile:()=>new URL('./manifold.wasm',import.meta.url).href});const result=buildPumpkin(await ready,data.params,data.contours);self.postMessage({id:data.id,...result});}
 catch(e){self.postMessage({id:data.id,error:e.message||String(e)});}
};
