import createManifold from 'manifold-3d';
import {buildPumpkin} from './geometry.mjs';
const ready=createManifold({locateFile:()=>new URL('./manifold.wasm',import.meta.url).href}).then(m=>{m.setup();return m;});
self.onmessage=async({data})=>{try{const result=buildPumpkin(await ready,data.params,data.contours);self.postMessage({id:data.id,...result});}catch(e){self.postMessage({id:data.id,error:e.message||String(e)});}};
