import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
const buildVersion=(process.env.GITHUB_SHA||Date.now().toString(36)).slice(0,12);
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/app.js','src/worker.js'],bundle:true,format:'esm',outdir:'dist',minify:true,external:['node:module'],define:{__BUILD_VERSION__:JSON.stringify(buildVersion)}});
for(const file of ['index.html','style.css']) await copyFile(`src/${file}`,`dist/${file}`);
const html=await readFile('dist/index.html','utf8');
await writeFile('dist/index.html',html.replace('./app.js"','./app.js?v='+buildVersion+'"'));
await copyFile('node_modules/manifold-3d/manifold.wasm','dist/manifold.wasm');
