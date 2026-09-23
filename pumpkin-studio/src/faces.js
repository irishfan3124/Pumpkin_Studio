export const presets={
 classic:[[[.13,.33],[.32,.08],[.41,.35]],[[.59,.35],[.68,.08],[.87,.33]],[[.43,.47],[.5,.34],[.57,.47]],[[.10,.60],[.28,.69],[.28,.59],[.40,.64],[.40,.76],[.60,.76],[.60,.64],[.72,.59],[.72,.69],[.9,.60],[.80,.85],[.63,.96],[.37,.96],[.2,.85]]],
 cheeky:[ellipse(.28,.25,.105,.14),ellipse(.72,.25,.105,.14),[[.12,.59],[.25,.66],[.4,.7],[.6,.7],[.75,.66],[.88,.59],[.8,.80],[.67,.92],[.5,.96],[.33,.92],[.2,.8]]],
 spooky:[[[.1,.12],[.43,.35],[.22,.40]],[[.9,.12],[.57,.35],[.78,.40]],[[.44,.49],[.5,.35],[.56,.49]],[[.08,.59],[.27,.68],[.34,.56],[.44,.73],[.55,.62],[.65,.75],[.75,.60],[.92,.57],[.80,.9],[.67,.81],[.55,.98],[.43,.85],[.31,.94],[.21,.79]]],blank:[]};
function ellipse(x,y,rx,ry){return Array.from({length:48},(_,i)=>[x+rx*Math.cos(i*Math.PI/24),y+ry*Math.sin(i*Math.PI/24)]);}
function selectedPixel(data,i,threshold,invert){
 const alpha=data[i+3]/255;
 const light=(.2126*data[i]+.7152*data[i+1]+.0722*data[i+2])*alpha+255*(1-alpha);
 return alpha>.08&&(invert?light>threshold:light<threshold);
}
// Measure only pixels selected for cutting, excluding blank/transparent margins.
export function cutoutBounds(data,w,h,threshold,invert){
 let left=w,top=h,right=-1,bottom=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(selectedPixel(data,(y*w+x)*4,threshold,invert)){
  left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
 }
 if(right<left)throw Error('No cutout was found. Use a dark design on a white or transparent background, or invert the selection.');
 return {x:left,y:top,width:right-left+1,height:bottom-top+1};
}
// Fit the artwork to the physical face rectangle with one uniform scale.
// All contours share the same bounds, preserving holes and feature spacing.
export function fitUploadedFace(loops,aspect){
 if(!loops.length)return [];
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(const loop of loops)for(const [x,y] of loop){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 const size=Math.max(right-left,(bottom-top)*aspect);
 if(!Number.isFinite(size)||size<=0||!Number.isFinite(aspect)||aspect<=0)throw Error('The uploaded face has no usable area.');
 const cx=(left+right)/2,cy=(top+bottom)/2;
 return loops.map(loop=>loop.map(([x,y])=>[.5+(x-cx)/size,.5+(y-cy)*aspect/size]));
}
// Trace boundaries of a binary raster, retaining holes with an even-odd fill.
export function traceMask(data,w,h,threshold,invert){
 const on=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&selectedPixel(data,(y*w+x)*4,threshold,invert);
 const edges=new Map();let total=0;const edge=(x,y,a,b)=>{const key=y*(w+1)+x;if(!edges.has(key))edges.set(key,[]);edges.get(key).push([a,b]);total++;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(on(x,y)){if(!on(x,y-1))edge(x,y,x+1,y);if(!on(x+1,y))edge(x+1,y,x+1,y+1);if(!on(x,y+1))edge(x+1,y+1,x,y+1);if(!on(x-1,y))edge(x,y+1,x,y);}
 if(total>16000)throw Error('This image has too much fine detail. Use a simpler silhouette or adjust the threshold.');
 const loops=[];while(edges.size){const start=edges.keys().next().value;let key=start,loop=[],guard=0;do{const x=key%(w+1),y=Math.floor(key/(w+1));loop.push([x/w,y/h]);const options=edges.get(key);if(!options)break;const next=options.pop();if(!options.length)edges.delete(key);key=next[1]*(w+1)+next[0];}while(key!==start&&guard++<=total);if(key===start&&loop.length>=6){const simple=loop.filter((v,i)=>{const a=loop[(i+loop.length-1)%loop.length],b=loop[(i+1)%loop.length];return Math.abs((v[0]-a[0])*(b[1]-v[1])-(v[1]-a[1])*(b[0]-v[0]))>1e-10;});if(simple.length>=3)loops.push(simple);}}
 if(!loops.length)throw Error('No cutout was found. Use a dark design on a white or transparent background, or invert the selection.');
 return loops;
}
