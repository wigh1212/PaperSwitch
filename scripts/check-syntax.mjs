import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const files=[];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(['vendor','node_modules'].includes(e.name))continue;const path=dir+'/'+e.name;if(e.isDirectory())await walk(path);else if(/\.(?:mjs|js)$/.test(path))files.push(path);}}
for(const dir of ['web','scripts','extension','src','tests'])await walk(dir);
let failed=0;for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status){console.error(r.stderr);failed++;}}
if(failed)process.exitCode=1;else console.log('PASS syntax: '+files.length+' owned JavaScript modules (not a style lint or dependency audit)');
