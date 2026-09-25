import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {zipSync,strToU8} from 'fflate';
import {binarySTL} from './geometry.mjs';
import {presets,presetInfo,traceMask,cutoutBounds,rotateUploadedFace,bridgeEnclosedRegions} from './faces.js';
const $=id=>document.getElementById(id);
const defaults={width:160,height:135,wall:3,ribs:10,clearance:.4,stemScale:125,stemClearance:.1,faceScale:65,faceY:0,imageRotation:0,textScale:100,recessDiameter:60,recessDepth:2};
const state={...defaults};let contours=presets.classic,uploadImage=null,textDesign=false,result=null,revision=0,timer,view='assembled',lit=false;
const worker=new Worker(new URL('./worker.js?v='+__BUILD_VERSION__,import.meta.url),{type:'module'});
const status=$('status');const exportButtons=[$('export'),$('export-body'),$('export-lid'),$('export-stem')];
let scene,camera,renderer,controls,bodyMesh,lidMesh,stemMesh,light,group;
for(const [id,face] of Object.entries(presetInfo)){const button=document.createElement('button');button.className='preset';button.dataset.face=id;button.setAttribute('aria-pressed',id==='classic'?'true':'false');if(id==='classic')button.classList.add('active');const icon=document.createElement('span');icon.textContent=face.icon;const label=document.createElement('small');label.textContent=face.label;button.append(icon,label);$('face-library').append(button);}
const orange=new THREE.MeshStandardMaterial({color:0xd66a22,roughness:.74,metalness:0});
const stemMaterial=new THREE.MeshStandardMaterial({color:0x5c6540,roughness:1});
try{
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.5,3000);camera.up.set(0,0,1);
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;$('scene').appendChild(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=180;controls.maxDistance=800;controls.maxPolarAngle=Math.PI*.52;controls.target.set(0,0,76);camera.position.set(220,-390,215);controls.update();
 scene.add(new THREE.HemisphereLight(0xfff7df,0x4f563b,2.1));const key=new THREE.DirectionalLight(0xffecd0,4);key.position.set(-160,-230,350);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-220,right:220,top:250,bottom:-220,near:1,far:1000});key.shadow.bias=-.001;key.shadow.normalBias=.15;scene.add(key);const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(120,120,250);scene.add(rim);
 light=new THREE.PointLight(0xffab36,0,300,1.5);light.position.set(0,-10,65);scene.add(light);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(1500,1500),new THREE.ShadowMaterial({opacity:.16}));floor.position.z=-.15;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(800,40,0xaab49b,0xbac2ad);grid.rotation.x=Math.PI/2;grid.position.z=-.2;grid.material.transparent=true;grid.material.opacity=.14;scene.add(grid);
 group=new THREE.Group();scene.add(group);
 new ResizeObserver(()=>{const {width,height}=$('scene').getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}).observe($('scene'));
 renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='3D preview interrupted. Reload the page to restore it.';});
}catch(e){status.textContent='3D preview needs WebGL. Try a browser with hardware acceleration. STL generation is still available.';}
function geometry(mesh){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(mesh.positions,3));g.setIndex(new THREE.BufferAttribute(mesh.indices,1));const smooth=toCreasedNormals(g,.6);if(smooth!==g)g.dispose();return smooth;}
function renderModel(data){if(!group)return;for(const m of [...group.children]){m.geometry.dispose();group.remove(m);}bodyMesh=new THREE.Mesh(geometry(data.body),orange);lidMesh=new THREE.Mesh(geometry(data.lid),orange);stemMesh=new THREE.Mesh(geometry(data.stem),stemMaterial);for(const m of [bodyMesh,lidMesh,stemMesh]){m.castShadow=true;m.receiveShadow=true;group.add(m);}applyView();}
function applyView(){if(!lidMesh)return;lidMesh.visible=stemMesh.visible=view!=='body';lidMesh.position.z=view==='exploded'?state.height*.20:0;stemMesh.position.z=view==='exploded'?state.height*.32:0;}
function labels(){const limit=Math.min(100,Math.floor(state.width*.65));$('recessDiameter').max=limit;state.recessDiameter=Math.min(state.recessDiameter,limit);for(const key of Object.keys(defaults)){const el=$(key);el.value=state[key];$(key+'-value').textContent=key==='recessDepth'&&state[key]===0?'Off':state[key]+(key==='ribs'?'':key==='faceScale'||key==='stemScale'||key==='textScale'?'%':key==='imageRotation'?'°':key==='stemClearance'?' mm per side':' mm');el.style.setProperty('--progress',((el.value-el.min)/(el.max-el.min)*100)+'%');}}
function queue(){revision++;exportButtons.forEach(b=>b.disabled=true);status.classList.remove('error');status.textContent='Carving your pumpkin…';clearTimeout(timer);timer=setTimeout(()=>worker.postMessage({id:revision,params:{...state,textDesign},contours:uploadImage||textDesign?rotateUploadedFace(contours,state.width*.65/(state.height*.51),state.imageRotation):contours}),220);}
worker.onmessage=({data})=>{if(data.id!==revision)return;if(data.error){status.textContent=data.error;status.classList.add('error');result=null;return;}result=data;renderModel(data);const s=data.stats;$('dimensions').textContent=s.dimensions.map(n=>Math.round(n)).join(' × ')+' mm';$('wall-stat').textContent=state.wall.toFixed(1)+' mm';status.textContent=`Hollow mesh · ${s.triangles.toLocaleString()} triangles · ${Math.floor(s.opening)} mm opening`;
 const detached=s.components!==1||s.lidComponents!==1||s.stemComponents!==1;exportButtons.forEach(b=>b.disabled=detached);$('mesh-note').textContent=detached?'This design creates detached pieces. Reduce the face size or use a connected stencil before exporting.':`Three closed meshes checked. ${s.recessDepth>0?`LED recess: Ø${s.recessDiameter} × ${s.recessDepth} mm; ${s.recessFloor.toFixed(1)} mm of solid base below it.`:'LED recess off.'} ${s.recessOccludesFace?'The raised base may cover low face details; reduce recess diameter or move the face up. ':''}Square stem peg: ${s.pegWidth.toFixed(1)} mm wide × ${s.pegDepth} mm long, with ${s.stemClearance} mm socket clearance per side. Test the fit before final assembly.`;
};
worker.onerror=()=>{result=null;exportButtons.forEach(b=>b.disabled=true);status.classList.add('error');status.textContent='The geometry engine could not load. Reload the page to try again.';};
for(const key of Object.keys(defaults))$(key).addEventListener('input',()=>{state[key]=Number($(key).value);labels();if(uploadImage&&$('autoBridge').checked&&['width','height','faceScale'].includes(key))maskImage();else queue();});
function setTextControls(enabled){$('textStyle').disabled=!enabled;$('textScale').disabled=!enabled;}
for(const button of document.querySelectorAll('[data-face]'))button.addEventListener('click',()=>{uploadImage=null;textDesign=false;setTextControls(false);state.textScale=defaults.textScale;labels();$('faceText').value='';contours=presets[button.dataset.face];$('image-options').hidden=true;$('imageRotation').disabled=true;$('rotation-hint').hidden=false;$('upload-name').textContent='Dark areas become cutouts. Simple silhouettes work best.';$('upload').value='';for(const b of document.querySelectorAll('[data-face]')){b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',b===button);}queue();});
const filterFaces=(query='')=>{let visible=0;for(const b of document.querySelectorAll('[data-face]')){b.hidden=!presetInfo[b.dataset.face].label.toLowerCase().includes(query.toLowerCase());if(!b.hidden)visible++;}$('no-faces').hidden=visible>0;};
$('face-search').addEventListener('input',()=>filterFaces($('face-search').value.trim()));
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{view=button.dataset.view;for(const b of document.querySelectorAll('[data-view]')){b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',b===button);}applyView();});
$('home').onclick=()=>{if(camera){controls.target.set(0,0,state.height*.53);camera.position.set(state.width*1.37,-state.width*2.44,state.height*1.6);controls.update();}};
$('glow').onclick=()=>{lit=!lit;$('glow').setAttribute('aria-pressed',lit);$('glow').textContent=lit?'☼ Lights on':'☼ Light it up';if(light){light.intensity=lit?1900:0;orange.emissive.set(lit?0x5b2101:0x000000);orange.emissiveIntensity=lit?.3:0;scene.children.filter(x=>x.isHemisphereLight).forEach(x=>x.intensity=lit?.65:2.1);}};
function maskImage(){
 if(!uploadImage)return;
 const threshold=Number($('threshold').value),invert=$('invert').checked;
 // Detect bounds at higher resolution before tracing so padding doesn't consume detail.
 const probe=document.createElement('canvas'),scale=Math.min(1,2048/Math.max(uploadImage.width,uploadImage.height));
 probe.width=Math.max(1,Math.round(uploadImage.width*scale));probe.height=Math.max(1,Math.round(uploadImage.height*scale));
 const scan=probe.getContext('2d',{willReadFrequently:true});scan.drawImage(uploadImage,0,0,probe.width,probe.height);
 const bounds=cutoutBounds(scan.getImageData(0,0,probe.width,probe.height).data,probe.width,probe.height,threshold,invert);
 const sx=bounds.x*uploadImage.width/probe.width,sy=bounds.y*uploadImage.height/probe.height;
 const sw=bounds.width*uploadImage.width/probe.width,sh=bounds.height*uploadImage.height/probe.height;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),ratio=Math.min(248/sw,248/sh);
 ctx.drawImage(uploadImage,sx,sy,sw,sh,(256-sw*ratio)/2,(256-sh*ratio)/2,sw*ratio,sh*ratio);
 const image=ctx.getImageData(0,0,256,256),autoBridge=$('autoBridge').checked;
 const faceWidth=state.width*state.faceScale/100,faceHeight=state.height*.51*state.faceScale/65;
 const halfWidth=Math.max(2,Math.ceil(1.4*256/Math.min(faceWidth,faceHeight)));
 const bridges=autoBridge?bridgeEnclosedRegions(image.data,256,256,threshold,invert,halfWidth):0;
 $('bridge-note').textContent=autoBridge?(bridges?`${bridges} enclosed area${bridges===1?'':'s'} connected with stencil bridges.`:'No enclosed areas need bridges.'):'Automatic connections are off; enclosed areas may become loose pieces.';
 contours=traceMask(image.data,256,256,threshold,invert);queue();
}
function bridgeTextCounters(image,width,height,bridgeHalf){
 const {data}=image,size=width*height,ink=new Uint8Array(size),outside=new Uint8Array(size),seen=new Uint8Array(size),queue=new Int32Array(size);
 for(let i=0;i<size;i++){const p=i*4;ink[i]=data[p+3]>12&&(.2126*data[p]+.7152*data[p+1]+.0722*data[p+2])*data[p+3]/255<128?1:0;}
 let head=0,tail=0;const seed=i=>{if(!ink[i]&&!outside[i]){outside[i]=1;queue[tail++]=i;}};
 for(let x=0;x<width;x++){seed(x);seed((height-1)*width+x);}for(let y=1;y<height-1;y++){seed(y*width);seed(y*width+width-1);}
 while(head<tail){const i=queue[head++],x=i%width,y=(i/width)|0;if(x>0)seed(i-1);if(x+1<width)seed(i+1);if(y>0)seed(i-width);if(y+1<height)seed(i+width);}
 for(let start=0;start<size;start++){if(ink[start]||outside[start]||seen[start])continue;head=0;tail=0;queue[tail++]=start;seen[start]=1;let bestY=-1,bestCount=0,rowMin=0,rowMax=0;const rows=new Map();
  while(head<tail){const i=queue[head++],x=i%width,y=(i/width)|0;let row=rows.get(y);if(!row){row={count:0,min:width,max:-1};rows.set(y,row);}row.count++;row.min=Math.min(row.min,x);row.max=Math.max(row.max,x);for(const n of [x>0?i-1:-1,x+1<width?i+1:-1,y>0?i-width:-1,y+1<height?i+width:-1])if(n>=0&&!ink[n]&&!outside[n]&&!seen[n]){seen[n]=1;queue[tail++]=n;}}
  for(const [y,row] of rows)if(row.count>bestCount){bestCount=row.count;bestY=y;rowMin=row.min;rowMax=row.max;}
  if(bestY<0)continue;let left=rowMin-1,right=rowMax+1;while(left>=0&&!outside[bestY*width+left])left--;while(right<width&&!outside[bestY*width+right])right++;
  const useLeft=left>=0&&(right>=width||rowMin-left<=right-rowMax),from=useLeft?left+1:rowMax,to=useLeft?rowMin:right-1;if(from>to||from<0||to>=width)continue;
  for(let y=Math.max(0,bestY-bridgeHalf);y<=Math.min(height-1,bestY+bridgeHalf);y++)for(let x=from;x<=to;x++)data[(y*width+x)*4+3]=0;
 }
 return image;
}
function makeTextContours(value){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const styles={block:'900 {size}px Arial, sans-serif',rounded:'900 {size}px Trebuchet MS, Arial, sans-serif',serif:'900 {size}px Georgia, serif',typewriter:'900 {size}px Courier New, monospace'},style=styles[$('textStyle').value]||styles.block;
 const wrap=(text,maxWidth)=>{const lines=[];for(const paragraph of text.split('\n')){let line='';for(const word of paragraph.trim().split(/\s+/).filter(Boolean)){const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue;}if(line)lines.push(line);line='';for(const char of Array.from(word)){if(line&&ctx.measureText(line+char).width>maxWidth){lines.push(line);line=char;}else line+=char;}}lines.push(line);}return lines;};
 let size=112,lines;do{ctx.font=style.replace('{size}',size);lines=wrap(value.toLocaleUpperCase(),456);if(lines.length<=3)break;size-=4;}while(size>=28);
 if(lines.length>3)throw Error('Use a shorter message or split it across fewer lines.');
 ctx.fillStyle='#000';ctx.textAlign='center';ctx.textBaseline='middle';const lineHeight=size*1.12,start=256-(lines.length-1)*lineHeight/2;lines.forEach((line,i)=>ctx.fillText(line,256,start+i*lineHeight));
 const stencil=bridgeTextCounters(ctx.getImageData(0,0,512,512),512,512,Math.max(7,Math.round(size*.09)));ctx.putImageData(stencil,0,0);const source=stencil.data,bounds=cutoutBounds(source,512,512,128,false),fit=document.createElement('canvas');fit.width=fit.height=256;
 const fitCtx=fit.getContext('2d',{willReadFrequently:true}),scale=Math.min(248/bounds.width,248/bounds.height);fitCtx.drawImage(canvas,bounds.x,bounds.y,bounds.width,bounds.height,(256-bounds.width*scale)/2,(256-bounds.height*scale)/2,bounds.width*scale,bounds.height*scale);
 return traceMask(fitCtx.getImageData(0,0,256,256).data,256,256,128,false);
}
function useTextDesign(){
 const value=$('faceText').value.trim();uploadImage=null;$('image-options').hidden=true;
 if(!value){textDesign=false;setTextControls(false);state.textScale=defaults.textScale;labels();contours=presets.blank;$('imageRotation').disabled=true;$('rotation-hint').hidden=false;$('upload-name').textContent='Type a message to turn it into cutouts.';queue();return;}
 try{setTextControls(true);contours=makeTextContours(value);textDesign=true;$('imageRotation').disabled=false;$('rotation-hint').hidden=true;$('upload-name').textContent='Text cutout: “'+value+'”';for(const b of document.querySelectorAll('[data-face]')){b.classList.remove('active');b.setAttribute('aria-pressed','false');}queue();}
 catch(e){revision++;clearTimeout(timer);result=null;exportButtons.forEach(b=>b.disabled=true);status.textContent=e.message;status.classList.add('error');}
}
$('faceText').addEventListener('input',useTextDesign);
$('textStyle').addEventListener('change',useTextDesign);
$('textScale').addEventListener('input',()=>{state.textScale=Number($('textScale').value);labels();queue();});
let uploadToken=0;
async function loadFile(file){if(!file)return;const token=++uploadToken;try{if(file.size>10*1024*1024)throw Error('Please choose a file under 10 MB.');if(!/\.(svg|png|jpe?g|webp)$/i.test(file.name))throw Error('Choose an SVG, PNG, JPG, or WebP file.');let blob=file;
 if(/\.svg$/i.test(file.name)){const text=await file.text();const doc=new DOMParser().parseFromString(text,'image/svg+xml');if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw Error('This SVG could not be read. Try exporting it again.');if(doc.querySelector('script,foreignObject,image,use')||/\bon\w+\s*=|(?:href\s*=)|url\s*\(|@import/i.test(text))throw Error('Use a self-contained SVG with paths and shapes; embedded links, images, and scripts are not supported.');blob=new Blob([text],{type:'image/svg+xml'});}
 const url=URL.createObjectURL(blob);const img=new Image();try{img.src=url;await img.decode();if(img.naturalWidth>12000||img.naturalHeight>12000)throw Error('Please resize the image below 12,000 pixels per side.');if(token!==uploadToken)return;uploadImage=img;textDesign=false;setTextControls(false);state.textScale=defaults.textScale;labels();$('faceText').value='';maskImage();}finally{URL.revokeObjectURL(url);}
 $('image-options').hidden=false;$('imageRotation').disabled=false;$('rotation-hint').hidden=true;$('upload-name').textContent=file.name+' · auto-fitted without blank margins · stays on this device';for(const b of document.querySelectorAll('[data-face]')){b.classList.remove('active');b.setAttribute('aria-pressed','false');}
 }catch(e){revision++;clearTimeout(timer);result=null;exportButtons.forEach(b=>b.disabled=true);$('upload-name').textContent=e.message;status.textContent=e.message;status.classList.add('error');}}
$('upload').onchange=e=>loadFile(e.target.files[0]);for(const type of ['dragover','dragleave','drop'])$('dropzone').addEventListener(type,e=>{e.preventDefault();$('dropzone').classList.toggle('drag',type==='dragover');if(type==='drop')loadFile(e.dataTransfer.files[0]);});
for(const id of ['threshold','invert','autoBridge'])$(id).addEventListener('input',()=>{$('threshold-value').textContent=$('threshold').value;try{maskImage();}catch(e){revision++;clearTimeout(timer);exportButtons.forEach(b=>b.disabled=true);status.textContent=e.message;status.classList.add('error');}});
function download(data,name,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function exportPart(which){if(!result||exportButtons[0].disabled)return;download(binarySTL(result[which]),`pumpkin-${which}-${state.width}mm.stl`,'model/stl');}
$('export-body').onclick=()=>exportPart('body');$('export-lid').onclick=()=>exportPart('lid');$('export-stem').onclick=()=>exportPart('stem');
$('export').onclick=()=>{if(!result||exportButtons[0].disabled)return;const s=result.stats;const readme=`PUMPKIN STUDIO\nUnits: millimeters.\nSettings: ${JSON.stringify(state,null,2)}\nOpening: ${s.opening.toFixed(1)} mm.\n\nThree separate closed meshes: body, lid, and stem. Print the stem in another color and press its square peg into the lid socket.\nPeg: ${s.pegWidth.toFixed(2)} mm square x ${s.pegDepth} mm long. Socket clearance: ${s.stemClearance} mm per side, with 0.3 mm bottom clearance. The peg tip has a lead-in taper. Printer tolerances vary: test the fit; lightly sand the peg if necessary.\nLED recess: ${s.recessDepth>0?`${s.recessDiameter} mm diameter x ${s.recessDepth} mm deep, with ${s.recessFloor.toFixed(1)} mm of solid base beneath it.`:'off.'}\nChoose a recess slightly larger than your measured puck.\nImport the STLs as separate objects and place each on the print bed in your slicer. Inspect orientation, overhang supports, wall thickness, and fit before printing.\nOnly use LED puck lights or battery candles. NEVER use a flame.\n`;download(zipSync({'pumpkin-body.stl':binarySTL(result.body),'pumpkin-lid.stl':binarySTL(result.lid),'pumpkin-stem.stl':binarySTL(result.stem),'PRINT-README.txt':strToU8(readme)}),'pumpkin-studio-STL.zip','application/zip');status.textContent='Three STL files downloaded as a ZIP. Extract the body, lid, and stem before opening your slicer.';};
$('reset').onclick=()=>{Object.assign(state,defaults);labels();$('threshold').value=128;$('threshold-value').textContent='128';$('invert').checked=false;$('autoBridge').checked=true;document.querySelector('[data-face="classic"]').click();document.querySelector('[data-view="assembled"]').click();if(lit)$('glow').click();$('home').click();};
$('help').onclick=()=>$('guide').showModal();$('close-guide').onclick=()=>$('guide').close();$('guide').addEventListener('click',e=>{if(e.target===$('guide')){const r=$('guide').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('guide').close();}});
if(document.modelContext?.registerTool){const schema={type:'object',properties:{width:{type:'number',minimum:100,maximum:240},height:{type:'number',minimum:100,maximum:210},wall:{type:'number',minimum:2,maximum:6},recessDiameter:{type:'number',minimum:20,maximum:100},recessDepth:{type:'number',minimum:0,maximum:8},face:{type:'string',enum:Object.keys(presets)}},additionalProperties:false};try{Promise.resolve(document.modelContext.registerTool({name:'configure_pumpkin',description:'Set pumpkin dimensions, wall thickness, and a built-in face, then regenerate the visible printable model.',inputSchema:schema,annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){for(const k of Object.keys(input)){const s=schema.properties[k];if(!s||k==='face'?!s||!s.enum.includes(input[k]):typeof input[k]!=='number'||!Number.isFinite(input[k])||input[k]<s.minimum||input[k]>s.maximum)throw Error('Invalid pumpkin setting: '+k);}for(const k of ['width','height','wall','recessDiameter','recessDepth'])if(k in input)state[k]=input[k];if(input.face)document.querySelector(`[data-face="${input.face}"]`).click();labels();queue();const id=revision;await new Promise((resolve,reject)=>{const listener=({data})=>{if(data.id!==id)return;worker.removeEventListener('message',listener);data.error?reject(Error(data.error)):resolve();};worker.addEventListener('message',listener);});return {settings:{...state},triangles:result.stats.triangles};}})).catch(()=>{});}catch{}}
labels();queue();

