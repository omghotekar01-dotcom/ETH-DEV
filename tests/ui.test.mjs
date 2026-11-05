import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createServer} from '../server/index.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async name=>readFile(path.join(root,name),'utf8');

test('entry HTML uses same-origin absolute URLs, includes CSS fallback, and has no hosted UI dependency',async()=>{
  const html=await read('public/index.html');
  assert.match(html,/href="\/style\.css"/);
  assert.match(html,/href="\/ios\.css"/);
  assert.match(html,/src="\/app\.mjs"/);
  assert.match(html,/<style>html,body\{/);
  assert.doesNotMatch(html,/href="https?:\/\/|src="https?:\/\//);
});

test('iOS design defines responsive navigation, accessible controls, and reduced-motion fallback',async()=>{
  const css=await read('public/ios.css');
  for(const rule of ['.mobile-nav{','.rail{','.hero-visual{','.intro-row{','@media(max-width:760px)','prefers-reduced-motion','@supports not']){
    assert.ok(css.includes(rule),`Missing style: ${rule}`);
  }
  const app=await read('public/app.mjs');
  assert.match(app,/function mobileNav\(\)/);
  assert.match(app,/aria-label="Mobile navigation"/);
  assert.match(app,/case'more':overlay='more'/);
  assert.match(app,/case'attack':dispatch\(\{type:'ATTACK'/);
  assert.match(app,/function apply0GAdvice\(/);
});

test('local server serves both CSS files and JavaScript with correct MIME types',async()=>{
  const server=createServer();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    for(const [route,fragment,mime] of [
      ['/','href="/ios.css"','text/html'],
      ['/style.css','.shell','text/css'],
      ['/ios.css','.mobile-nav','text/css'],
      ['/app.mjs','function mobileNav','text/javascript'],
      ['/engine.mjs','SPEND_POLICY','text/javascript']
    ]){
      const response=await fetch(base+route);
      assert.equal(response.status,200,route);
      assert.match(response.headers.get('content-type'),new RegExp(mime));
      assert.ok((await response.text()).includes(fragment),`Missing ${fragment} in ${route}`);
    }
  }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});