import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server/index.mjs';

test('launch smoke: serving complete game assets and enforcing API boundaries', async () => {
  const server = createServer();
  await new Promise((resolve,reject) => {
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const {port} = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    for (const [url, mime, snippet] of [
      ['/', 'text/html','<div id="root"></div>'],
      ['/app.mjs','text/javascript','import {AGENTS'],
      ['/engine.mjs','text/javascript','export const MISSIONS'],
      ['/style.css','text/css','.shell']
    ]) {
      const response = await fetch(`${base}${url}`);
      assert.equal(response.status,200,`Failed ${url}`);
      assert.match(response.headers.get('content-type'),new RegExp(mime));
      assert.ok((await response.text()).includes(snippet),`Unexpected contents: ${url}`);
    }
    const health=await fetch(`${base}/api/health`);
    assert.equal(health.status,200);
    const status=await health.json();
    assert.equal(status.name,'RIFT');
    assert.equal(status.mode,'sandbox');
    assert.equal(status.liveVerification.hedera,false);
    const secret=await fetch(`${base}/api/agent/plan`,{method:'POST',headers:{authorization:'Bearer definitely-invalid-qa-token','content-type':'application/json'},body:'{}'});
    assert.equal(secret.status,403,'Inference must reject unknown token');
    const missing=await fetch(`${base}/this-does-not-exist`);
    assert.equal(missing.status,404);
    const head=await fetch(`${base}/`,{method:'HEAD'});
    assert.equal(head.status,200);
    assert.equal((await head.text()).length,0);
  } finally {
    await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  }
});
