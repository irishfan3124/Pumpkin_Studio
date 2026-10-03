import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {Resvg} from '@resvg/resvg-js';
import {PNG} from 'pngjs';

const svg = await readFile(new URL('./resources/app-icon.svg', import.meta.url), 'utf8');
const assets = new URL('./ios/App/App/Assets.xcassets/', import.meta.url);
const rendered = new Resvg(svg, {fitTo: {mode: 'width', value: 1024}}).render().asPng();
// App Store icons must not have an alpha channel, even with opaque pixels.
const icon = PNG.sync.write(PNG.sync.read(rendered), {colorType: 2});
await writeFile(new URL('AppIcon.appiconset/AppIcon-512@2x.png', assets), icon);
await mkdir(new URL('PumpkinMark.imageset/', assets), {recursive: true});
const mark = svg.replace(/<rect id="background"[^>]*\/>/, '');
await writeFile(new URL('PumpkinMark.imageset/pumpkin-mark.png', assets), new Resvg(mark, {fitTo: {mode: 'width', value: 384}}).render().asPng());
await writeFile(new URL('PumpkinMark.imageset/Contents.json', assets), JSON.stringify({
  images: [{filename: 'pumpkin-mark.png', idiom: 'universal'}], info: {author: 'xcode', version: 1}
}, null, 2) + '\n');
