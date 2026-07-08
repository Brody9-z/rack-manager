const http=require('http'),fs=require('fs'),path=require('path');
const ROOT='C:/Users/Administrator/.openclaw/workspace/rack-manager';
const M={'.html':'text/html;charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png'};
http.createServer((q,r)=>{let f=path.join(ROOT,q.url==='/'?'index.html':q.url);
fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end('404');return;}
r.writeHead(200,{'Content-Type':M[path.extname(f)]||'octet-stream'});r.end(d);});}).listen(8899,'0.0.0.0',()=>console.log('ok'));
