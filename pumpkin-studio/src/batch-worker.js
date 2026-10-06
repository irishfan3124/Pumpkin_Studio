import createManifold from 'manifold-3d';
import {buildPumpkin} from './geometry.mjs';
import {generateBatch} from './batch-core.mjs';
let ready;
function initialize(options){ready=createManifold(options).then(lib=>{lib.setup();return lib;});ready.catch(()=>{});}
self.onmessage=async({data})=>{
  if(data.type==='init'){initialize({wasmBinary:data.wasmBinary,locateFile:()=> 'manifold.wasm'});return;}
  try{
    if(!ready)initialize({locateFile:()=>new URL('./manifold.wasm',import.meta.url).href});
    const lib=await ready;
    const result=await generateBatch(data.selection,{build:(params,contours)=>buildPumpkin(lib,params,contours),onProgress:progress=>self.postMessage({type:'progress',...progress})});
    self.postMessage({type:'ready',...result},[result.data.buffer]);
  }catch(error){self.postMessage({type:'error',error:error.message||String(error)});}
};
