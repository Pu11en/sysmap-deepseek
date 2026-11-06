import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { validate, build } from '../scripts/build.mjs'
import { createServer } from '../scripts/serve.mjs'

const example = JSON.parse(await fs.readFile(new URL('../examples/library.plan.json', import.meta.url), 'utf8'))
const clone = () => structuredClone(example)

test('validates explicit child links and allows repeated local node ids', () => {
  assert.equal(validate(clone()).length, 2)
})
test('rejects a missing destination instead of guessing by local node id', () => {
  const plan = clone(); plan.nodes[1].detail = 'Missing'
  assert.throws(() => validate(plan), /Missing detail/)
})
test('rejects duplicate local nodes and case-colliding page filenames', () => {
  const plan = clone(); plan.nodes.push({ ...plan.nodes[0] })
  assert.throws(() => validate(plan), /Duplicate node/)
  const other = clone(); other.steps.push({ ...other.steps[0], id:'checkcopies' })
  assert.throws(() => validate(other), /Duplicate page/)
})
test('rejects unknown edge endpoints, unlabelled arrows and invalid statuses', () => {
  let plan = clone(); plan.links[0].to = 'Missing'
  assert.throws(() => validate(plan), /unknown node/)
  plan = clone(); delete plan.links[0].label
  assert.throws(() => validate(plan), /needs a label/)
  plan = clone(); plan.nodes[0].status = 'done'
  assert.throws(() => validate(plan), /Invalid status/)
})
test('supports nested explicit pages and rejects cycles or orphan pages', () => {
  const plan = clone()
  plan.steps[0].nodes[1].detail = 'Records'
  plan.steps.push({id:'Records',label:'Saved records',nodes:[{id:'READ',label:'Saved copies'}],links:[]})
  assert.equal(validate(plan).length,3)
  plan.steps[1].nodes[0].detail = 'CheckCopies'
  assert.throws(() => validate(plan), /cycle/)
  delete plan.steps[1].nodes[0].detail
  delete plan.steps[0].nodes[1].detail
  assert.throws(() => validate(plan), /Unreachable/)
})
test('builds scoped navigation and preserves old output on validation failure', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'sysmap-build-'))
  t.after(() => fs.rm(root,{recursive:true,force:true}))
  const source = path.join(root,'sample.plan.json'), output=path.join(root,'output')
  await fs.writeFile(source,JSON.stringify(example))
  const manifest=await build(source,output)
  assert.equal(manifest.pages.main.details.CHECK,'CheckCopies')
  assert.deepEqual(manifest.pages.CheckCopies.details,{})
  assert.match(await fs.readFile(path.join(output,'sample.mmd'),'utf8'),/flowchart TD/)
  const before=await fs.readFile(path.join(output,'sample.json'),'utf8')
  const invalid=clone(); invalid.nodes[1].detail='Missing'
  await fs.writeFile(source,JSON.stringify(invalid))
  await assert.rejects(build(source,output),/Missing detail/)
  assert.equal(await fs.readFile(path.join(output,'sample.json'),'utf8'),before)
})
test('local server serves only map assets and viewer', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'sysmap-server-'))
  const server=createServer(root)
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await fs.rm(root,{recursive:true,force:true})})
  await fs.writeFile(path.join(root,'sample.json'),'{}')
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const base='http://127.0.0.1:'+server.address().port
  assert.equal((await fetch(base+'/view.html')).status,200)
  assert.equal((await fetch(base+'/maps/sample.json')).status,200)
  assert.equal((await fetch(base+'/maps/.env')).status,404)
  assert.equal((await fetch(base+'/maps/%2e%2e%5csecret.json')).status,404)
  assert.equal((await fetch(base+'/maps/sample.json',{method:'POST'})).status,405)
})
test('viewer script parses and scopes destinations through page metadata', async () => {
  const html=await fs.readFile(new URL('../viewer/index.html',import.meta.url),'utf8')
  // Parse module-style script as async body (dynamic import remains unresolved).
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor
  assert.doesNotThrow(()=>new AsyncFunction(html.match(/<script type="module">([\s\S]*?)<\/script>/)[1]))
  assert.ok(html.includes('entry.details[id]'))
  assert.ok(html.includes("e.code!=='Space'"))
  assert.ok(!html.includes('C:\\Users\\'))
})
