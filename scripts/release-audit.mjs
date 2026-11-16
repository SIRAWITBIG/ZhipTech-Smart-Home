import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const git=(args,allowFailure=false)=>{
 const r=spawnSync('git',['-c',`safe.directory=${root}`,...args],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
 if(r.status!==0&&!allowFailure)throw new Error(`Git audit failed: ${args[0]}`);
 return r.status===0?r.stdout:null;
};
const rules=[
 ['private key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
 ['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/],
 ['cloud access key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
 ['literal bearer',/Bearer\s+[A-Za-z0-9_.-]{24,}/],
 ['board credential',/^\s*#define\s+HUB_(?:WIFI_SSID|WIFI_PASSWORD|API_KEY|SETUP_AP_PASSWORD)\s+"[^"\r\n]+"/m],
 ['assigned credential',/\b(?:password|secret|accessToken|apiKey)\s*[:=]\s*["'][A-Za-z0-9_+\/-]{24,}["']/i],
];
const findings=[];
function scan(label,bytes){
 if(bytes.includes(0))return;
 const text=bytes.toString('utf8');
 for(const [name,pattern] of rules)if(pattern.test(text))findings.push(`${label}: ${name}`);
}
const files=git(['ls-files','-z']).split('\0').filter(Boolean);
if(!files.length)throw new Error('Nothing tracked: stage reviewed source first.');
for(const filename of files){
 if(/(?:^|\/)(?:node_modules|\.pio|\.tools|\.vercel|tmp|outputs|data|dist)(?:\/|$)/.test(filename)
   || /(?:^|\/)\.env(?:$|\.(?!example$))/.test(filename)
   || /(?:config_local\.h|local_config\.h|secrets\.h|\.(?:pem|p12|pfx|key))$/.test(filename))findings.push(`${filename}: forbidden tracked path`);
 const staged=git(['show',`:${filename}`]);scan(`index:${filename}`,Buffer.from(staged));
}
// Scan every reachable historical blob, not just the working tree. Never print values.
const objects=git(['rev-list','--objects','--all'],true)?.trim().split('\n').filter(Boolean)||[];
let historicalBlobs=0;
for(const object of objects){
 const id=object.split(' ')[0];
 if(git(['cat-file','-t',id])!=='blob\n')continue;
 historicalBlobs++;scan(`history:${id}`,Buffer.from(git(['cat-file','blob',id])));
}
async function scanOutput(dir){
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);
  if(entry.isDirectory())await scanOutput(full);else if(!entry.name.endsWith('.gz'))scan(path.relative(root,full),await fs.readFile(full));
 }
}
try{await scanOutput(path.join(root,'dist'));}catch(e){if(e.code!=='ENOENT')throw e;}
if(findings.length){console.error(findings.join('\n'));process.exitCode=1;}
else console.log(`Release audit passed: ${files.length} indexed files, ${historicalBlobs} historical blobs, and existing dist assets; no matching credential patterns or forbidden tracked paths. Pattern scan is not proof against every possible secret.`);
