import assert from 'node:assert/strict';
import init from 'manifold-3d';
import {buildPumpkin,binarySTL} from './src/geometry.mjs';
import {presets,traceMask} from './src/faces.js';
const lib=await init();lib.setup();
const defaults={width:160,height:135,wall:3,ribs:10,clearance:.3,faceScale:65,faceY:0};
function manifold(mesh){return new lib.Manifold(new lib.Mesh({numProp:3,vertProperties:mesh.positions,triVerts:mesh.indices}));}
function check(name,params,face){const r=buildPumpkin(lib,params,face);assert.equal(r.stats.components,1,name+' body connected');assert.equal(r.stats.lidComponents,1,name+' lid connected');assert.ok(Math.abs(r.stats.dimensions[0]-params.width)<.01);for(const part of ['body','lid']){const m=manifold(r[part]);assert.equal(m.status(),'NoError');assert.ok(m.volume()>0);const stl=binarySTL(r[part]);assert.equal(stl.length,84+r[part].indices.length/3*50);const edges=new Map();const idx=r[part].indices;for(let i=0;i<idx.length;i+=3)for(let k=0;k<3;k++){const a=idx[i+k],b=idx[i+(k+1)%3],key=a<b?a+','+b:b+','+a;edges.set(key,(edges.get(key)||0)+1);}assert.ok([...edges.values()].every(n=>n===2),name+' watertight edges');m.delete();}
const b=manifold(r.body),l=manifold(r.lid),overlap=b.intersect(l);assert.ok(overlap.volume()<.01,name+' lid clears body');overlap.delete();b.delete();l.delete();console.log('PASS',name,r.stats.triangles+' triangles');return r;}
for(const [name,face] of Object.entries(presets))check(name,defaults,face);
check('small thick shell',{...defaults,width:100,height:100,wall:6,ribs:14},presets.classic);
check('large tall shell',{...defaults,width:240,height:210,wall:2,ribs:7,clearance:.8},presets.spooky);
check('tall narrow shell',{...defaults,width:100,height:210,wall:6,ribs:14},presets.cheeky);
check('wide short shell',{...defaults,width:240,height:100,wall:2,ribs:7},presets.classic);
const w=64,rgba=new Uint8ClampedArray(w*w*4).fill(255);for(let y=12;y<40;y++)for(let x=12;x<24;x++){const i=(y*w+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=0;}
const loops=traceMask(rgba,w,w,128,false);assert.equal(loops.length,1);check('raster silhouette',defaults,loops);
assert.throws(()=>traceMask(new Uint8ClampedArray(w*w*4).fill(255),w,w,128,false),/No cutout/);
console.log('All mesh, clearance, STL, and raster checks passed.');
