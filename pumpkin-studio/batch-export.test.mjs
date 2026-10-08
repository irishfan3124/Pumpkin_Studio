import test from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {generateBatch} from './src/batch-core.mjs';
import {validateBatch,defaultSettings} from './src/batch-catalog.mjs';

test('batch selections reject unknown, empty, duplicate or custom settings',()=>{
  for(const input of [null,{}, {faces:['classic','classic'],sizes:['small']},{faces:['upload'],sizes:['small']},{faces:['classic'],sizes:['giant']},{faces:['classic'],sizes:['small'],wall:4}])assert.throws(()=>validateBatch(input));
});
test('collection contains separately named complete kits using defaults at each size',async()=>{
  const params=[],progress=[];
  const build=p=>{params.push(p);return {body:new Uint8Array([1]),lid:new Uint8Array([2]),stem:new Uint8Array([3]),stats:{components:1,lidComponents:1,stemComponents:1}};};
  const {data,total}=await generateBatch({faces:['classic','cheeky'],sizes:['small','large']},{build,encode:x=>x,yieldControl:async()=>{},onProgress:p=>progress.push(p)});
  const outer=unzipSync(data);assert.equal(total,4);
  assert.deepEqual(Object.keys(outer),['Classic - Small.zip','Classic - Large.zip','Wink - Small.zip','Wink - Large.zip']);
  for(const [name,zip] of Object.entries(outer)){const files=unzipSync(zip);assert.deepEqual(Object.keys(files),['pumpkin-body.stl','pumpkin-lid.stl','pumpkin-stem.stl','PRINT-README.txt']);assert.equal(files['pumpkin-stem.stl'][0],3);assert.match(strFromU8(files['PRINT-README.txt']),/LED lights only/);assert.ok(strFromU8(files['PRINT-README.txt']).includes(name.slice(0,-4)));}
  assert.deepEqual(params[0],{...defaultSettings,width:125,height:100});assert.deepEqual(params[1],{...defaultSettings,width:240,height:200});assert.equal(progress.at(-1).completed,4);
});
test('batch aborts on disconnected body, lid or stem instead of exporting a broken collection',async()=>{
  for(const key of ['components','lidComponents','stemComponents'])await assert.rejects(generateBatch({faces:['classic'],sizes:['small']},{build:()=>({stats:{components:1,lidComponents:1,stemComponents:1,[key]:2}}),yieldControl:async()=>{}}),/disconnected/);
});

test('native cancellation during the yield prevents generation of the next pumpkin',async()=>{
  let cancelled=false,built=0;
  await assert.rejects(generateBatch({faces:['classic'],sizes:['small','large']},{
    build:()=>{built++;return {body:new Uint8Array([1]),lid:new Uint8Array([2]),stem:new Uint8Array([3]),stats:{components:1,lidComponents:1,stemComponents:1}};},
    encode:x=>x,shouldCancel:()=>cancelled,
    onProgress:p=>{if(p.completed===1)cancelled=true;},yieldControl:async()=>{}
  }),{name:'AbortError'});
  assert.equal(built,1);
});

test('cancelling before generation or during final assembly does not return a partial collection',async()=>{
  await assert.rejects(generateBatch({faces:['classic'],sizes:['small']},{shouldCancel:()=>true,build:()=>assert.fail('cancelled batch must not build')}),{name:'AbortError'});
  let cancelled=false,yields=0;
  await assert.rejects(generateBatch({faces:['classic'],sizes:['small']},{
    build:()=>({body:new Uint8Array([1]),lid:new Uint8Array([2]),stem:new Uint8Array([3]),stats:{components:1,lidComponents:1,stemComponents:1}}),
    encode:x=>x,shouldCancel:()=>cancelled,yieldControl:async()=>{if(++yields===2)cancelled=true;}
  }),{name:'AbortError'});
});
