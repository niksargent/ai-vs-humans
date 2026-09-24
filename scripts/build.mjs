import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('dist', {recursive:true});
for (const name of ['index.html','styles.css','machine.css']) await copyFile(name, `dist/${name}`);
await copyFile('.nojekyll','dist/.nojekyll');
await mkdir('dist/audio', {recursive:true});
for (const name of ['switch','warning','crisis','resolve']) await copyFile(`assets/audio/${name}.mp3`, `dist/audio/${name}.mp3`);
