import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const pkg=JSON.parse(await readFile('package.json','utf8'));
for(const [name,version] of Object.entries(pkg.dependencies)){
  if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error(`${name}: exact version required in package.json`);
  const installed=JSON.parse(await readFile(`node_modules/${name}/package.json`,'utf8')).version;
  if(installed!==version)throw new Error(`${name}: installed ${installed}, expected ${version}; install from lockfile`);
}
for(const asset of JSON.parse(await readFile('config/assets.json','utf8'))){
  const actual=createHash('sha256').update(await readFile(asset.path)).digest('hex');
  if(actual!==asset.sha256)throw new Error(`Asset changed: ${asset.path}. Review its source and update config/assets.json.`);
}
console.log('Dependency versions and bundled assets verified.');
