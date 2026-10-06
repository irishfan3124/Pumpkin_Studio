import {presetInfo} from './faces.js';

export const defaultSettings=Object.freeze({width:160,height:135,wall:3,ribs:10,clearance:.4,stemScale:125,stemClearance:.1,faceScale:65,faceY:0,imageRotation:0,textScale:100,recessDiameter:60,recessDepth:2});
export const batchSizes=Object.freeze({small:{label:'Small',width:125,height:100},medium:{label:'Medium',width:175,height:145},large:{label:'Large',width:240,height:200}});
export const batchFaces=Object.freeze(Object.entries(presetInfo).map(([id,{label}])=>({id,label})));

export function validateBatch(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Choose at least one face and size.');
  const allowed=['faces','sizes'];
  if(Object.keys(input).some(k=>!allowed.includes(k)))throw Error('Batch export uses default printing settings.');
  for(const [field,ids,max] of [['faces',batchFaces.map(f=>f.id),batchFaces.length],['sizes',Object.keys(batchSizes),3]]){
    const values=input[field];
    if(!Array.isArray(values)||!values.length||values.length>max||new Set(values).size!==values.length||values.some(id=>!ids.includes(id)))throw Error('Choose valid, distinct '+field+'.');
  }
  return {faces:[...input.faces],sizes:[...input.sizes]};
}
