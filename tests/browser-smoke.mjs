// Optional real-browser render check. Set CHROME to your Chromium/Chrome executable.
// This checks rendering, not physical keyboard or mouse behavior.
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { build } from '../scripts/build.mjs'
import { createServer } from '../scripts/serve.mjs'
if (!process.env.CHROME) throw new Error('Set CHROME to a Chrome or Chromium executable')
const temporary=await fsp.mkdtemp(path.join(os.tmpdir(),'deepseek-browser-'))
const output=path.join(temporary,'output')
await build(fileURLToPath(new URL('../examples/library.plan.json',import.meta.url)),output)
const server=createServer(output)
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const fd=fs.openSync(path.join(temporary,'dom.html'),'w')
try {
  const child=spawn(process.env.CHROME,['--headless=new','--disable-gpu','--no-first-run','--user-data-dir='+path.join(temporary,'profile'),'--virtual-time-budget=15000','--dump-dom','http://127.0.0.1:'+server.address().port+'/view.html?map=library'],{stdio:['ignore',fd,'ignore']})
  const timeout=setTimeout(()=>child.kill(),45000)
  const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve) }).finally(()=>clearTimeout(timeout))
  assert.equal(code,0,'Browser must exit successfully')
  const dom=await fsp.readFile(path.join(temporary,'dom.html'),'utf8')
  assert.match(dom,/<svg[^>]+id="deepseek_/,'Expected Mermaid-rendered SVG')
  assert.match(dom,/class="[^"]*linked/,'Expected a node with explicit child navigation')
  console.log('PASS: real Chromium rendered the example and attached a detail link. Physical interactions and other harnesses remain unverified.')
} finally {
  fs.closeSync(fd)
  await new Promise(resolve=>server.close(resolve))
  console.log('Browser artifacts: '+temporary)
}
