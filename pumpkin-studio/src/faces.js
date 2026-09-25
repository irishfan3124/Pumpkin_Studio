export const presetInfo={
 classic:{label:'Classic',icon:'◀ ▴ ▶'},cheeky:{label:'Cheeky',icon:'◕ ◕'},spooky:{label:'Spooky',icon:'◢ ◣'},blank:{label:'Blank',icon:'○'},
 happy:{label:'Happy',icon:'☺'},grin:{label:'Big grin',icon:'▰▰'},sleepy:{label:'Sleepy',icon:'－ －'},surprised:{label:'Surprised',icon:'○ ○'},
 mischief:{label:'Mischief',icon:'◕ ◡'},goofy:{label:'Goofy',icon:'◉ ◔'},grumpy:{label:'Grumpy',icon:'◢ ◣'},frightened:{label:'Frightened',icon:'⊙ ⊙'},
 vampire:{label:'Vampire',icon:'▾ ▾'},cat:{label:'Black cat',icon:'▲ ▲'},bat:{label:'Bat',icon:'◢ ◣'},skull:{label:'Skull',icon:'◉ ◉'},
 monster:{label:'Monster',icon:'✦ ◉'},ghost:{label:'Ghost',icon:'◦ ◦'},witch:{label:'Witch',icon:'✦ ◕'},cyclops:{label:'Cyclops',icon:'◎'},
};
const eye=(x,y,w=.2,h=.27)=>ellipse(x,y,w/2,h/2);
const slant=(x,y,w,h,slope=0)=>[[x-w/2,y+h/2-slope],[x+w/2,y+h/2+slope],[x+w*.22,y-h/2+slope],[x-w*.3,y-h/2-slope]];
const triangle=(x,y,w,h,down=false)=>down?[[x-w/2,y-h/2],[x+w/2,y-h/2],[x,y+h/2]]:[[x-w/2,y+h/2],[x+w/2,y+h/2],[x,y-h/2]];
const star=(x,y,r=.13,inner=.055)=>Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,d=i%2?r*inner/.13:r;return[x+Math.cos(a)*d,y+Math.sin(a)*d];});
const smile=[[.17,.60],[.31,.67],[.5,.70],[.69,.67],[.83,.60],[.77,.76],[.65,.86],[.5,.90],[.35,.86],[.23,.76]];
const grin=[[.12,.58],[.27,.64],[.38,.59],[.5,.64],[.62,.59],[.73,.64],[.88,.58],[.82,.78],[.70,.88],[.58,.93],[.42,.93],[.30,.88],[.18,.78]];
const frown=[[.18,.78],[.31,.70],[.42,.67],[.5,.69],[.58,.67],[.69,.70],[.82,.78],[.80,.85],[.67,.79],[.5,.76],[.33,.79],[.20,.85]];
const oval=(x,y,rx,ry)=>ellipse(x,y,rx,ry);
const rect=(x,y,w,h)=>[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]];
export const presets={
 classic:[[[.13,.33],[.32,.08],[.41,.35]],[[.59,.35],[.68,.08],[.87,.33]],[[.43,.47],[.5,.34],[.57,.47]],[[.10,.60],[.28,.69],[.28,.59],[.40,.64],[.40,.76],[.60,.76],[.60,.64],[.72,.59],[.72,.69],[.9,.60],[.80,.85],[.63,.96],[.37,.96],[.2,.85]]],
 cheeky:[eye(.28,.25,.21,.28),eye(.72,.25,.21,.28),smile],
 spooky:[[[.1,.12],[.43,.35],[.22,.40]],[[.9,.12],[.57,.35],[.78,.40]],[[.44,.49],[.5,.35],[.56,.49]],[[.08,.59],[.27,.68],[.34,.56],[.44,.73],[.55,.62],[.65,.75],[.75,.60],[.92,.57],[.80,.9],[.67,.81],[.55,.98],[.43,.85],[.31,.94],[.21,.79]]],
 blank:[],
 happy:[eye(.30,.29),eye(.70,.29),smile],
 grin:[slant(.29,.29,.25,.28,-.04),slant(.71,.29,.25,.28,.04),grin],
 sleepy:[oval(.30,.31,.13,.065),oval(.70,.31,.13,.065),[[.24,.68],[.37,.72],[.5,.74],[.63,.72],[.76,.68],[.70,.79],[.5,.84],[.30,.79]]],
 surprised:[eye(.29,.26,.25,.33),eye(.71,.26,.25,.33),oval(.5,.69,.105,.15)],
 mischief:[slant(.29,.28,.24,.24,-.08),oval(.70,.28,.11,.17),[[.20,.65],[.35,.69],[.5,.66],[.65,.63],[.81,.57],[.76,.75],[.61,.82],[.43,.82],[.28,.76]]],
 goofy:[eye(.29,.27,.26,.34),eye(.72,.32,.16,.20),[[.20,.61],[.35,.67],[.45,.62],[.55,.68],[.66,.62],[.80,.65],[.73,.82],[.60,.89],[.45,.85],[.32,.9],[.22,.79]]],
 grumpy:[slant(.29,.30,.25,.21,.07),slant(.71,.30,.25,.21,-.07),frown],
 frightened:[eye(.29,.27,.25,.33),eye(.71,.27,.25,.33),oval(.5,.73,.105,.17)],
 vampire:[eye(.30,.28),eye(.70,.28),[[.18,.59],[.35,.65],[.5,.62],[.65,.65],[.82,.59],[.76,.82],[.64,.90],[.57,.73],[.5,.91],[.43,.73],[.36,.90],[.24,.82]]],
 cat:[triangle(.30,.30,.25,.31),triangle(.70,.30,.25,.31),triangle(.5,.54,.11,.08,true),[[.5,.58],[.39,.68],[.27,.65],[.2,.60],[.29,.72],[.42,.73],[.5,.67],[.58,.73],[.71,.72],[.8,.60],[.73,.65],[.61,.68]]],
 bat:[[[.08,.23],[.32,.31],[.40,.47],[.18,.42]],[[.92,.23],[.68,.31],[.60,.47],[.82,.42]],oval(.5,.57,.05,.06),grin],
 skull:[eye(.29,.29,.24,.30),eye(.71,.29,.24,.30),triangle(.5,.53,.12,.13),rect(.5,.77,.40,.16),rect(.39,.76,.035,.15),rect(.50,.76,.035,.15),rect(.61,.76,.035,.15)],
 monster:[star(.28,.29,.15),eye(.71,.29,.23,.30),[[.17,.62],[.31,.68],[.43,.61],[.55,.69],[.68,.61],[.83,.64],[.77,.83],[.64,.91],[.5,.86],[.36,.92],[.22,.81]]],
 ghost:[eye(.31,.31,.13,.17),eye(.69,.31,.13,.17),[[.21,.61],[.34,.65],[.44,.60],[.55,.66],[.66,.61],[.79,.65],[.73,.78],[.60,.82],[.48,.78],[.36,.83],[.24,.76]]],
 witch:[star(.30,.28,.14),slant(.70,.29,.23,.23,.05),[[.19,.63],[.33,.68],[.48,.64],[.63,.68],[.81,.59],[.75,.78],[.60,.86],[.44,.83],[.30,.79]]],
 cyclops:[eye(.5,.30,.30,.38),[[.20,.64],[.34,.69],[.5,.66],[.66,.69],[.80,.64],[.73,.82],[.5,.91],[.27,.82]]],
};
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
// Rotate in the pumpkin face's physical coordinate system, then refit it.
// This avoids clipping a wide image when it is turned upright (or vice versa).
export function rotateUploadedFace(loops,aspect,degrees=0){
 const fitted=fitUploadedFace(loops,aspect);
 if(!degrees)return fitted;
 const radians=degrees*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
 const physical=fitted.map(loop=>loop.map(([x,y])=>{
   const px=(x-.5)*aspect,py=(y-.5);
   return [c*px-s*py,s*px+c*py];
 }));
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(const loop of physical)for(const [x,y] of loop){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 const width=right-left,height=bottom-top,scale=Math.min(aspect/width,1/height);
 return physical.map(loop=>loop.map(([x,y])=>[.5+(x-(left+right)/2)*scale/aspect,.5+(y-(top+bottom)/2)*scale]));
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
