import {Zip,ZipPassThrough,zipSync,strToU8} from 'fflate';
import {batchFaces,batchSizes,defaultSettings,validateBatch} from './batch-catalog.mjs';
import {presets} from './faces.js';
import {binarySTL} from './geometry.mjs';

export async function generateBatch(input,{build,onProgress=()=>{},yieldControl=()=>new Promise(resolve=>setTimeout(resolve,0)),encode=binarySTL}={}){
  const {faces,sizes}=validateBatch(input),total=faces.length*sizes.length,chunks=[];
  let completed=0,length=0;
  const archive=new Zip((error,data)=>{if(error)throw error;chunks.push(data);length+=data.length;});
  for(const face of faces)for(const size of sizes){
    const spec=batchSizes[size],label=batchFaces.find(f=>f.id===face).label+' - '+spec.label;
    onProgress({completed,total,label});await yieldControl();
    const result=build({...defaultSettings,width:spec.width,height:spec.height},presets[face]);
    if([result.stats.components,result.stats.lidComponents,result.stats.stemComponents].some(n=>n!==1))throw Error(label+' contains disconnected parts. No collection was exported.');
    const readme=`Pumpkin Studio — ${label}\nBody: ${spec.width} mm wide × ${spec.height} mm tall. Other settings use defaults.\nWall: 3 mm. Lid clearance: 0.4 mm. Stem size: 125%. Stem socket clearance: 0.1 mm per side.\nLED recess: 60 mm diameter × 2 mm deep.\nImport the body, lid, and stem in millimeters. Place each on the print bed and inspect overhangs and supports.\nMatch the small alignment nubs at the back of the body and lid. Press the stem's square peg into the lid.\nUse battery LED lights only, never a flame. Check fit with your printer before making many copies.\nhttps://irishfan3124.github.io/Pumpkin_Studio/\n`;
    const zip=zipSync({'pumpkin-body.stl':encode(result.body),'pumpkin-lid.stl':encode(result.lid),'pumpkin-stem.stl':encode(result.stem),'PRINT-README.txt':strToU8(readme)},{level:6});
    const entry=new ZipPassThrough(label+'.zip');archive.add(entry);entry.push(zip,true);
    onProgress({completed:++completed,total,label});
  }
  archive.end();const data=new Uint8Array(length);let offset=0;
  for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
  return {data,total};
}
