/* Static file server. No dependencies.
   Used locally by the /server skill and on the VPS under PM2. */

var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var PORT = parseInt(process.env.PORT, 10) || 8080;

var TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

http.createServer(function (req, res) {
  var rel = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';

  var file = path.normalize(path.join(ROOT, rel));
  if (file.indexOf(ROOT) !== 0) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(file, function (err, buf) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    var type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    // The service worker must never be served stale, or updates never land.
    var cache = path.basename(file) === 'sw.js' ? 'no-cache' : 'public, max-age=300';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache });
    res.end(buf);
  });
}).listen(PORT, function () {
  console.log('tisha-bav-countdown listening on ' + PORT);
});
