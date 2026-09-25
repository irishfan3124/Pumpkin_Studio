import assert from 'node:assert/strict';
import init from 'manifold-3d';
import {buildPumpkin,binarySTL} from './src/geometry.mjs';
import {presets,traceMask} from './src/faces.js';
const lib=await init();lib.setup();
const defaults={width:160,height:135,wall:3,ribs:10,clearance:.3,faceScale:65,faceY:0,recessDiameter:60,recessDepth:2};
function manifold(mesh){return new lib.Manifold(new lib.Mesh({numProp:3,vertProperties:mesh.positions,triVerts:mesh.indices}));}
function check(name,params,face){const r=buildPumpkin(lib,params,face);assert.equal(r.stats.components,1,name+' body connected');assert.equal(r.stats.lidComponents,1,name+' lid connected');assert.equal(r.stats.stemComponents,1,name+' stem connected');assert.ok(r.stats.triangles>220000,name+' high resolution');assert.ok(Math.abs(r.stats.dimensions[0]-params.width)<.01);for(const part of ['body','lid','stem']){const m=manifold(r[part]);assert.equal(m.status(),'NoError');assert.ok(m.volume()>0);const stl=binarySTL(r[part]);assert.equal(stl.length,84+r[part].indices.length/3*50);const edges=new Map();const idx=r[part].indices;for(let i=0;i<idx.length;i+=3)for(let k=0;k<3;k++){const a=idx[i+k],b=idx[i+(k+1)%3],key=a<b?a+','+b:b+','+a;edges.set(key,(edges.get(key)||0)+1);}assert.ok([...edges.values()].every(n=>n===2),name+' watertight edges');m.delete();}
const b=manifold(r.body),l=manifold(r.lid),stem=manifold(r.stem),overlap=b.intersect(l);assert.ok(overlap.volume()<.01,name+' lid clears body');overlap.delete();
for(const lift of [0,1,3,6,8]){const raised=stem.translate([0,0,lift]),collision=raised.intersect(l);assert.ok(collision.volume()<.01,name+' square peg insertion clearance');collision.delete();raised.delete();}
const cross=stem.slice(r.stats.stemSeat-2);assert.ok(Math.abs(cross.area()-r.stats.pegWidth**2)<.001,name+' square peg size');cross.delete();
const sw=r.stats.socketWidth-.02,seat=r.stats.stemSeat;
const socketProbe=lib.Manifold.cube([sw,sw,.1]).translate([-sw/2,-sw/2,seat-r.stats.pegDepth-.2]),socketFill=l.intersect(socketProbe);assert.ok(socketFill.volume()<.001,name+' socket depth clearance');socketFill.delete();socketProbe.delete();
const socketFloor=lib.Manifold.cube([sw,sw,.1]).translate([-sw/2,-sw/2,seat-r.stats.pegDepth-.5]),socketGap=socketFloor.subtract(l);assert.ok(socketGap.volume()<.001,name+' socket has a closed floor');socketGap.delete();socketFloor.delete();
if(params.recessDepth>0){
 const radius=params.recessDiameter/2,s=r.stats;
 const interior=lib.Manifold.cylinder(params.recessDepth-.02,radius-.05,radius-.05,128).translate([0,0,s.recessFloor+.01]);const filled=b.intersect(interior);assert.ok(filled.volume()<.001,name+' recess is empty');filled.delete();interior.delete();
 const floorProbe=lib.Manifold.cylinder(.1,radius-.05,radius-.05,128).translate([0,0,s.recessFloor-.1]);const missing=floorProbe.subtract(b);assert.ok(missing.volume()<.001,name+' continuous recess floor');missing.delete();floorProbe.delete();assert.ok(s.recessFloor>=params.wall,name+' floor thickness protected');
 const lower=lib.CrossSection.circle(radius+.05,128),upper=lib.CrossSection.circle(radius+.5,128),ring=upper.subtract(lower),ring3=ring.extrude(.1).translate([0,0,s.recessFloor+params.recessDepth-.11]),gap=ring3.subtract(b);assert.ok(gap.volume()<.001,name+' full depth rim');gap.delete();ring3.delete();ring.delete();lower.delete();upper.delete();
}
b.delete();l.delete();stem.delete();console.log('PASS',name,r.stats.triangles+' triangles');return r;}
for(const [name,face] of Object.entries(presets))check(name,defaults,face);
check('small thick shell',{...defaults,width:100,height:100,wall:6,ribs:14},presets.classic);
check('large tall shell',{...defaults,width:240,height:210,wall:2,ribs:7,clearance:.8},presets.spooky);
check('tall narrow shell',{...defaults,width:100,height:210,wall:6,ribs:14},presets.cheeky);
check('wide short shell',{...defaults,width:240,height:100,wall:2,ribs:7},presets.classic);
check('largest deep recess',{...defaults,width:240,height:100,wall:2,recessDiameter:100,recessDepth:8},presets.blank);
check('small pumpkin reinforced recess',{...defaults,width:100,height:100,wall:2,recessDiameter:65,recessDepth:8},presets.blank);
check('recess disabled',{...defaults,recessDepth:0},presets.blank);
check('full-wrap text stencil',{...defaults,textDesign:true,textWrap:true,textScale:125},presets.classic);
const w=64,rgba=new Uint8ClampedArray(w*w*4).fill(255);for(let y=12;y<40;y++)for(let x=12;x<24;x++){const i=(y*w+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=0;}
const loops=traceMask(rgba,w,w,128,false);assert.equal(loops.length,1);check('raster silhouette',defaults,loops);
assert.throws(()=>traceMask(new Uint8ClampedArray(w*w*4).fill(255),w,w,128,false),/No cutout/);
console.log('All mesh, clearance, STL, and raster checks passed.');
