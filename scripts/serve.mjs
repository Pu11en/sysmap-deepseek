import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const viewer = fileURLToPath(new URL('../viewer/index.html', import.meta.url))
export function createServer(directory) {
  const root = path.resolve(directory)
  return http.createServer(async (req, res) => {
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, headers); res.end(); return }
      const url = new URL(req.url, 'http://localhost')
      let file
      let type
      if (url.pathname === '/' || url.pathname === '/view.html') {
        file = viewer
        type = 'text/html; charset=utf-8'
      } else if (url.pathname.startsWith('/maps/')) {
        const name = decodeURIComponent(url.pathname.slice(6))
        if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*\.(json|mmd)$/.test(name) || name.includes('..')) throw new Error('Not found')
        file = path.join(root, name)
        type = name.endsWith('.json') ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8'
      } else throw new Error('Not found')
      const content = await fs.readFile(file)
      res.writeHead(200, { ...headers, 'Content-Type': type })
      res.end(req.method === 'HEAD' ? undefined : content)
    } catch { res.writeHead(404, headers); res.end('Not found') }
  })
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2)
  const directory = args[args.indexOf('--dir') + 1]
  const port = args.includes('--port') ? Number(args[args.indexOf('--port') + 1]) : 4321
  if (!args.includes('--dir') || !directory || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('Usage: node scripts/serve.mjs --dir <output-directory> [--port 4321]')
    process.exitCode = 2
  } else {
    const server = createServer(directory)
    server.on('error', error => { console.error(error.message); process.exitCode = 1 })
    server.listen(port, '127.0.0.1', () => console.log(`Local viewer: http://127.0.0.1:${port}/view.html?map=<plan-name>`))
  }
}
