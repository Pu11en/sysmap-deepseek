import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const idPattern = /^[A-Za-z][A-Za-z0-9_]*$/
const shapes = new Set(['start', 'step', 'decision', 'store', 'external'])
const statuses = new Set(['built', 'planned', 'broken', 'changed'])
const classes = [
  'classDef built fill:#DCFCE7,stroke:#16A34A,color:#0F172A,stroke-width:2px',
  'classDef planned fill:#F8FAFC,stroke:#94A3B8,color:#0F172A,stroke-width:2px,stroke-dasharray:5 4',
  'classDef broken fill:#FEE2E2,stroke:#DC2626,color:#0F172A,stroke-width:2px',
  'classDef changed fill:#DBEAFE,stroke:#2563EB,color:#0F172A,stroke-width:4px',
]
const fail = message => { throw new Error(message) }
const nonempty = value => typeof value === 'string' && value.trim().length > 0

export function validate(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) fail('Plan must be an object')
  if (!nonempty(plan.goal)) fail('Plan needs a goal')
  if (!Array.isArray(plan.steps)) fail('steps must be a list')
  const pages = [{ ...plan, id: 'main', label: plan.title || plan.goal }, ...plan.steps]
  const byId = new Map()
  const filenames = new Set()
  for (const page of pages) {
    if (!page || !idPattern.test(page.id || '')) fail('Invalid page id')
    const key = page.id.toLowerCase()
    if (filenames.has(key)) fail(`Duplicate page id: ${page.id}`)
    filenames.add(key)
    byId.set(page.id, page)
    if (!nonempty(page.label)) fail(`Page ${page.id} needs a label`)
    if (!Array.isArray(page.nodes) || !page.nodes.length) fail(`Page ${page.id} needs nodes`)
    if (!Array.isArray(page.links)) fail(`Page ${page.id} needs links`)
    const ids = new Set()
    for (const node of page.nodes) {
      if (!node || !idPattern.test(node.id || '') || node.id.toLowerCase() === 'end') fail(`Invalid node id in ${page.id}`)
      if (ids.has(node.id)) fail(`Duplicate node ${node.id} in ${page.id}`)
      ids.add(node.id)
      if (!nonempty(node.label)) fail(`Node ${node.id} needs a label`)
      if (!shapes.has(node.shape || 'step')) fail(`Invalid shape for ${node.id}`)
      if (!statuses.has(node.status || 'planned')) fail(`Invalid status for ${node.id}`)
      if (node.detail !== undefined && !idPattern.test(node.detail)) fail(`Invalid detail for ${node.id}`)
    }
    for (const link of page.links) {
      if (!link || !ids.has(link.from) || !ids.has(link.to)) fail(`Link references unknown node in ${page.id}`)
      if (!nonempty(link.label)) fail(`Link in ${page.id} needs a label`)
    }
  }
  for (const page of pages) for (const node of page.nodes) {
    if (node.detail !== undefined && !byId.has(node.detail)) fail(`Missing detail page ${node.detail}`)
  }
  const visited = new Set()
  const active = new Set()
  function visit(id) {
    if (active.has(id)) fail(`Detail cycle at ${id}`)
    if (visited.has(id)) return
    active.add(id)
    for (const node of byId.get(id).nodes) if (node.detail !== undefined) visit(node.detail)
    active.delete(id)
    visited.add(id)
  }
  visit('main')
  for (const page of pages) if (!visited.has(page.id)) fail(`Unreachable detail page ${page.id}`)
  return pages
}

function escapeLabel(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\|/g, '&#124;').replace(/\r?\n/g, '<br/>')
}
export function mermaid(page) {
  const lines = ['flowchart TD']
  for (const node of page.nodes) {
    const label = escapeLabel(node.label)
    const forms = { start: `(["${label}"])`, step: `["${label}"]`, decision: `{"${label}"}`, store: `[("${label}")]`, external: `[["${label}"]]` }
    lines.push(`  ${node.id}${forms[node.shape || 'step']}:::${node.status || 'planned'}`)
  }
  for (const link of page.links) lines.push(`  ${link.from} -->|"${escapeLabel(link.label)}"| ${link.to}`)
  return [...lines, ...classes.map(line => '  ' + line), ''].join('\n')
}

export async function build(source, output) {
  if (!source.endsWith('.plan.json')) fail('Source must end in .plan.json')
  const name = path.basename(source, '.plan.json')
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name)) fail('Use a simple plan filename')
  const plan = JSON.parse((await fs.readFile(source, 'utf8')).replace(/^\uFEFF/, ''))
  const pages = validate(plan) // Validate everything before writing any output.
  const manifest = { version: 1, name, title: plan.title || name, pages: {} }
  const files = []
  for (const page of pages) {
    const file = `${name}${page.id === 'main' ? '' : '-' + page.id}.mmd`
    manifest.pages[page.id] = { label: page.label, file, details: Object.fromEntries(page.nodes.filter(node => node.detail !== undefined).map(node => [node.id, node.detail])) }
    files.push([file, mermaid(page)])
  }
  await fs.mkdir(output, { recursive: true })
  for (const [file, content] of files) await fs.writeFile(path.join(output, file), content, 'utf8')
  // Manifest is last: stale files are harmless and never auto-deleted.
  await fs.writeFile(path.join(output, name + '.json'), JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2)
  const index = args.indexOf('--out')
  if (!args[0] || index < 0 || !args[index + 1]) {
    console.error('Usage: node scripts/build.mjs <name>.plan.json --out <output-directory>')
    process.exitCode = 2
  } else {
    try {
      const result = await build(path.resolve(args[0]), path.resolve(args[index + 1]))
      console.log(`Built ${result.name}: ${Object.keys(result.pages).length} pages. SVG rendering happens in the browser, not this command.`)
    } catch (error) { console.error(error.message); process.exitCode = 1 }
  }
}
