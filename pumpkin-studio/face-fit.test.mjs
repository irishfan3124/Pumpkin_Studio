import assert from 'node:assert/strict';
import {test} from 'node:test';
import {cutoutBounds,fitUploadedFace,rotateUploadedFace,traceMask} from './src/faces.js';

function raster({padding=0,transparent=false,invert=false}={}){
 // The browser traces on a square canvas so X and Y use the same pixel scale.
 const width=40+padding*2,height=width,data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const selected=x>=padding+5&&x<padding+35&&y>=padding+5&&y<padding+15;
  const i=(y*width+x)*4,value=selected?(invert?255:0):(invert?0:255);
  data[i]=data[i+1]=data[i+2]=value;data[i+3]=transparent&&!selected?0:255;
 }
 return {width,height,data};
}
const extent=loops=>{const pts=loops.flat();return [Math.max(...pts.map(p=>p[0]))-Math.min(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))-Math.min(...pts.map(p=>p[1]))];};
test('finds the selected artwork inside large white or transparent margins',()=>{
 for(const transparent of [false,true])for(const invert of [false,true]){
  const r=raster({padding:200,transparent,invert});
  assert.deepEqual(cutoutBounds(r.data,r.width,r.height,128,invert),{x:205,y:205,width:30,height:10});
 }
});
test('padded and tightly cropped versions fit identically',()=>{
 for(const aspect of [.6,1.5,3]){
  const shapes=[0,100].map(padding=>{const r=raster({padding});return fitUploadedFace(traceMask(r.data,r.width,r.height,128,false),aspect);});
  for(let i=0;i<shapes[0][0].length;i++)for(let axis=0;axis<2;axis++)assert.ok(Math.abs(shapes[0][0][i][axis]-shapes[1][0][i][axis])<1e-12);
 }
});
test('fits wide and tall art to the full face rectangle without stretching',()=>{
 for(const [width,height] of [[5,1],[1,5],[1,1]])for(const aspect of [.6,1.5,3]){
  const loop=[[[4,8],[4+width,8],[4+width,8+height],[4,8+height]]];
  const fitted=fitUploadedFace(loop,aspect),[w,h]=extent(fitted);
  assert.ok(Math.abs(Math.max(w,h)-1)<1e-12);
  assert.ok(Math.abs(w*aspect/h-width/height)<1e-12,'physical aspect ratio');
  assert.ok(fitted.flat().every(p=>p.every(v=>v>=-1e-12&&v<=1+1e-12)));
 }
});
test('holes and separate features share one scale and center',()=>{
 const outer=[[2,3],[6,3],[6,7],[2,7]],hole=[[3,4],[5,4],[5,6],[3,6]];
 const fitted=fitUploadedFace([outer,hole],1);
 assert.equal(fitted.length,2);assert.deepEqual(extent([fitted[1]]),[.5,.5]);
 assert.deepEqual(fitted[1][0],[.25,.25]);
});
test('rotated artwork remains centered, proportionate, and inside the face area',()=>{
 const loops=[[[0,0],[4,0],[4,1],[0,1]],[[1,.25],[2,.25],[2,.75],[1,.75]]];
 const a=rotateUploadedFace(loops,1.8,90),b=rotateUploadedFace(loops,1.8,-45);
 for(const result of [a,b]){
  const points=result.flat();
  assert.ok(points.every(([x,y])=>x>=-1e-12&&x<=1+1e-12&&y>=-1e-12&&y<=1+1e-12));
  const center=[points.reduce((n,[x])=>n+x,0)/points.length,points.reduce((n,[,y])=>n+y,0)/points.length];
  assert.ok(Math.abs(center[0]-.5)<.08&&Math.abs(center[1]-.5)<.08);
 }
 assert.notDeepEqual(a,rotateUploadedFace(loops,1.8,0));
});
test('white or fully transparent images produce a useful error',()=>{
 assert.throws(()=>cutoutBounds(new Uint8ClampedArray(16).fill(255),2,2,128,false),/No cutout/);
 assert.throws(()=>cutoutBounds(new Uint8ClampedArray(16),2,2,128,true),/No cutout/);
});
