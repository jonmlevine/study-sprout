import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {validateInput,offlineTopics,createPlan} from './public/engine.js';
import {hasOCI,generateOCI} from './oci.mjs';

const publicDir=fileURLToPath(new URL('./public/',import.meta.url));
const files=new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.js','app.js'],['/engine.js','engine.js'],['/favicon.svg','favicon.svg']]);
for(const file of ['adaptive.js','adaptive.css','demo.html','demo.css','demo.js'])files.set('/'+file,file);
files.set('/demo','demo.html');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
export function makeServer() {
  let activeGenerations=0;
  let lastOCISuccess=null;
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
    try {
      const url=new URL(req.url,'http://localhost');
      if(req.method==='GET' && url.pathname==='/api/config') return json(200,{ociAvailable:hasOCI(),ociVerified:Boolean(lastOCISuccess),lastOCISuccess,storage:'browser',version:'1.1.0'});
      if(req.method==='POST' && url.pathname==='/api/plan') {
        if(req.headers.origin && new URL(req.headers.origin).host!==req.headers.host) return json(403,{error:'This request must come from the Study Sprout app.'});
        if(!req.headers['content-type']?.startsWith('application/json')) return json(415,{error:'Send JSON study data.'});
        let size=0,chunks=[];
        for await(const chunk of req) {size+=chunk.length;if(size>100000)return json(413,{error:'Your notes are too large. Use at most 20,000 characters.'});chunks.push(chunk);}
        let raw;try{raw=JSON.parse(Buffer.concat(chunks).toString());}catch{return json(400,{error:'Invalid JSON request.'});}
        let input;try{input=validateInput(raw);}catch(e){return json(400,{error:e.message});}
        const provider=raw.provider||'offline';
        if(!['oci','offline'].includes(provider))return json(400,{error:'Choose OCI or offline mode.'});
        if(provider==='oci'&&!hasOCI())return json(503,{error:'OCI is not configured. Use offline mode, or configure the server first.'});
        if(activeGenerations>=2)return json(429,{error:'Two plans are already being generated. Please try again shortly.'});
        activeGenerations++;
        try {
          const topics=provider==='oci'?await generateOCI(input):offlineTopics(input.notes);
          const plan=createPlan(input,topics,provider);
          if(provider==='oci')lastOCISuccess=new Date().toISOString();
          return json(200,plan);
        } catch(e) {return json(provider==='oci'?502:400,{error:e.message});}
        finally {activeGenerations--;}
      }
      if(req.method==='GET'&&files.has(url.pathname)) {
        const file=files.get(url.pathname);const content=await readFile(path.join(publicDir,file));
        res.writeHead(200,{'Content-Type':types[path.extname(file)]});return res.end(content);
      }
      return json(404,{error:'Not found.'});
    }catch{if(!res.headersSent)json(500,{error:'Something went wrong. Please try again.'});else res.end();}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const envFile=fileURLToPath(new URL('./.env',import.meta.url));
  if(existsSync(envFile))process.loadEnvFile(envFile);
  const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
  const server=makeServer();
  server.listen(port,host,()=>console.log(`Study Sprout is ready at http://${host}:${port} (${hasOCI()?'OCI available':'offline mode'})`));
  server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is in use. Set PORT to another port, or open the existing app.`:e.message);process.exitCode=1;});
}
