import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
const buildVersion=(process.env.GITHUB_SHA||Date.now().toString(36)).slice(0,12);
await mkdir('dist',{recursive:true});
await build({entryPoints:['src/app.js','src/worker.js','src/batch-worker.js'],bundle:true,format:'esm',outdir:'dist',target:['safari17'],minify:true,external:['node:module'],define:{__BUILD_VERSION__:JSON.stringify(buildVersion)}});
for(const file of ['index.html','style.css','privacy.html']) await copyFile(`src/${file}`,`dist/${file}`);
const html=await readFile('dist/index.html','utf8');
await writeFile('dist/index.html',html.replace('./app.js"','./app.js?v='+buildVersion+'"'));
await copyFile('node_modules/manifold-3d/manifold.wasm','dist/manifold.wasm');
await mkdir('dist/fonts',{recursive:true});
for(const [font,weights] of [['dm-sans',[400,500,600,700]],['manrope',[400,500,600,700,800]]]){
 for(const weight of weights)await copyFile(`node_modules/@fontsource/${font}/files/${font}-latin-${weight}-normal.woff2`,`dist/fonts/${font}-${weight}.woff2`);
 await copyFile(`node_modules/@fontsource/${font}/LICENSE`,`dist/fonts/${font}-LICENSE.txt`);
}
