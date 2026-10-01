const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const root = __dirname
const port = Number(process.env.PORT) || 8767
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4'
}

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  const file = path.resolve(root, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '')
  if (file !== root && !file.startsWith(root + path.sep)) {
    response.writeHead(403)
    response.end()
    return
  }
  fs.readFile(file, (error, content) => {
    if (error) {
      response.writeHead(404)
      response.end('Not found')
      return
    }
    response.writeHead(200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8' })
    response.end(content)
  })
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/`))
