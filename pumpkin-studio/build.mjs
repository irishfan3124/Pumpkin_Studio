import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/app.js','src/worker.js'],bundle:true,format:'esm',outdir:'dist',minify:true,external:['node:module']});
for(const file of ['index.html','style.css']) await copyFile(`src/${file}`,`dist/${file}`);
await copyFile('node_modules/manifold-3d/manifold.wasm','dist/manifold.wasm');
