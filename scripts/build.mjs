import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('dist', {recursive:true});
for (const name of ['index.html','styles.css','machine.css']) await copyFile(name, `dist/${name}`);
await copyFile('.nojekyll','dist/.nojekyll');
