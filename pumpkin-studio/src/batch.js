import {batchFaces,batchSizes} from './batch-catalog.mjs';
import {createGeometryWorker} from './worker-loader.mjs';
import {startBatchJob} from './batch-job.mjs';

export function initBatchExport({saveExport,nativeIOS=false,runNativeBatch}){
  const root=document.createElement('section');root.className='batch-panel';root.id='batch-export';
  root.innerHTML=`<p class="eyebrow">MORE PUMPKINS. FEWER CLICKS.</p><h2>Batch Export</h2><p>Choose built-in faces and sizes. ${nativeIOS?'Save and share':'Download'} a collection of ZIPs, each with a body, lid, and stem.</p><p class="hint">All printing settings use the defaults. Custom artwork and text use the single-model export above. Large batches can take several minutes; ${nativeIOS?'keep the app open and start with a few pumpkins on older devices':'keep this tab open'}.</p><div class="batch-selections"><fieldset><legend>Faces</legend><button class="text-button batch-select-all" type="button">Select all faces</button><div class="batch-faces"></div></fieldset><fieldset><legend>Sizes</legend><div class="batch-sizes"></div></fieldset></div><div class="batch-actions"><button class="primary batch-generate" type="button">Generate batch</button><button class="text-button batch-cancel" type="button" hidden>Cancel</button><button class="text-button batch-download" type="button" hidden>${nativeIOS?'Save & share collection':'Download collection'}</button></div><progress class="batch-progress" aria-label="Batch export progress" max="1" value="0" hidden></progress><p class="batch-status hint" role="status">Free. Models are generated on your device.</p>`;
  document.getElementById('export-status').after(root);
  if(location.hash==='#batch-export')root.scrollIntoView({block:'start'});
  const find=s=>root.querySelector(s),generate=find('.batch-generate'),cancel=find('.batch-cancel'),download=find('.batch-download'),note=find('.batch-status'),progress=find('progress');
  const addOption=(selector,value,text,checked)=>{const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.value=value;input.checked=checked;label.append(input,document.createTextNode(text));find(selector).append(label);};
  for(const face of batchFaces)addOption('.batch-faces',face.id,face.label,face.id==='classic');
  for(const [id,size] of Object.entries(batchSizes))addOption('.batch-sizes',id,`${size.label} · ${size.width} × ${size.height} mm`,true);
  let job=null,busy=false,saving=false,cancelling=false,collection=null,run=0;
  const selected=selector=>[...root.querySelectorAll(selector+' input:checked')].map(input=>input.value);
  const message=(text,error=false)=>{note.textContent=text;note.classList.toggle('error',error);};
  const refresh=()=>{const count=selected('.batch-faces').length*selected('.batch-sizes').length;generate.textContent=`Generate ${count} pumpkin${count===1?'':'s'}`;generate.disabled=busy||saving||!count;root.querySelectorAll('fieldset').forEach(el=>el.disabled=busy||saving);cancel.hidden=!busy;cancel.disabled=cancelling;download.hidden=!collection;download.disabled=saving;};
  find('.batch-select-all').onclick=()=>{const inputs=[...root.querySelectorAll('.batch-faces input')],all=inputs.every(i=>i.checked);inputs.forEach(i=>i.checked=!all);find('.batch-select-all').textContent=all?'Select all faces':'Clear all faces';refresh();};
  root.addEventListener('change',refresh);
  cancel.onclick=()=>{
    if(nativeIOS&&job){cancelling=true;job.cancel();message('Stopping after the current pumpkin…');refresh();}
    else{run++;job?.cancel();job=null;busy=false;progress.hidden=true;message('Batch cancelled. Choose faces and sizes to try again.');refresh();}
  };
  generate.onclick=async()=>{
    if(generate.disabled)return;
    const current=++run;collection=null;busy=true;cancelling=false;progress.hidden=false;progress.value=0;refresh();message('Loading the geometry engine…');
    try{
      const selection={faces:selected('.batch-faces'),sizes:selected('.batch-sizes')};
      const options={runId:current,onProgress:data=>{if(run!==current||cancelling)return;progress.max=data.total;progress.value=data.completed;message(`${data.completed} of ${data.total} ready · ${data.label}…`);}};
      let active;
      if(nativeIOS)active=runNativeBatch(selection,options);
      else{
        const engine=await createGeometryWorker(new URL('./batch-worker.js?v='+__BUILD_VERSION__,import.meta.url),new URL('./manifold.wasm',import.meta.url),false);
        if(run!==current){engine.terminate();return;}
        active=startBatchJob(engine,selection,options);
      }
      job=active;
      const data=await active.done;
      if(run!==current)return;
      collection=data.data;message(`${data.total} pumpkin${data.total===1?'':'s'} ready. ${nativeIOS?'Save and share':'Download'} the collection, then extract each Face Name - Size ZIP.`);
    }catch(error){
      if(run!==current)return;
      progress.hidden=true;message(error.name==='AbortError'?'Batch cancelled. Choose faces and sizes to try again.':error.message,error.name!=='AbortError');
    }finally{if(run===current){job=null;busy=false;cancelling=false;refresh();}}
  };
  download.onclick=async()=>{
    if(!collection||saving)return;saving=true;refresh();
    try{
      const saved=await saveExport(collection,'Pumpkin Studio - Batch.zip','application/zip');
      message(saved.destination==='files'
        ?`Saved in Files → On My iPhone/iPad → Pumpkin Studio → ${saved.path}.${saved.shareError?' Sharing could not finish. Open the collection in Files to share it again.':saved.shared?'':' You can share it later from Files.'} Extract each pumpkin ZIP to find its three STL parts and printing notes.`
        :'Collection downloaded. Each pumpkin ZIP contains its three STL parts and printing notes.');
    }catch(error){message(error.message+` You can retry ${nativeIOS?'Save & share collection':'Download collection'}.`,true);}
    finally{saving=false;refresh();}
  };
  refresh();
}
