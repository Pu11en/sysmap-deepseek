// Recreate documentation screenshots with Chrome/Chromium. Requires CHROME and internet access.
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { build } from './build.mjs'
import { createServer } from './serve.mjs'

if (!process.env.CHROME) throw new Error('Set CHROME to a Chrome or Chromium executable')
const root=fileURLToPath(new URL('../',import.meta.url))
const images=path.join(root,'docs','images')
await fsp.mkdir(images,{recursive:true})
const temporary=await fsp.mkdtemp(path.join(os.tmpdir(),'sysmap-docs-'))
const output=path.join(temporary,'output')
await build(path.join(root,'examples','library.plan.json'),output)
const server=createServer(output)
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const base='http://127.0.0.1:'+server.address().port
try {
  for(const [name,query] of [['overview','?map=library'],['detail','?map=library&page=CheckCopies&trail=%5B%22main%22%5D']]) {
    const screenshot=path.join(images,name+'.png')
    const domFile=path.join(temporary,name+'.html')
    const fd=fs.openSync(domFile,'w')
    try {
      const child=spawn(process.env.CHROME,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--force-device-scale-factor=1','--window-size=1200,900','--user-data-dir='+path.join(temporary,'profile-'+name),'--virtual-time-budget=15000','--screenshot='+screenshot,'--dump-dom',base+'/view.html'+query],{stdio:['ignore',fd,'ignore']})
      const timeout=setTimeout(()=>child.kill(),45000)
      const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve)}).finally(()=>clearTimeout(timeout))
      assert.equal(code,0,'Browser must complete '+name)
      const dom=await fsp.readFile(domFile,'utf8')
      assert.match(dom,/<svg[^>]+id="sysmap_/,'Map must render before '+name+' capture')
      assert.ok((await fsp.stat(screenshot)).size>15000,'Screenshot must contain more than blank chrome')
      console.log('Captured '+name+'.png')
    } finally { fs.closeSync(fd) }
  }
} finally { await new Promise(resolve=>server.close(resolve)) }
