import createManifold from 'manifold-3d';
import {buildPumpkin} from './geometry.mjs';
let ready;
function initialize(options){ready=createManifold(options).then(m=>{m.setup();return m;});ready.catch(()=>{});}
self.onmessage=async({data})=>{
 if(data.type==='init'){initialize({wasmBinary:data.wasmBinary,locateFile:()=> 'manifold.wasm'});return;}
 try{if(!ready)initialize({locateFile:()=>new URL('./manifold.wasm',import.meta.url).href});const result=buildPumpkin(await ready,data.params,data.contours);self.postMessage({id:data.id,...result});}
 catch(e){self.postMessage({id:data.id,error:e.message||String(e)});}
};
