// Local UI fixture only; exposes the three files needed by the simulated transfer hub.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = {
    '/test/auto-bid-harness.html': ['test/auto-bid-harness.html', 'text/html; charset=utf-8'],
    '/src/auto-bid-core.js': ['src/auto-bid-core.js', 'text/javascript; charset=utf-8'],
    '/src/market-catalog.js': ['src/market-catalog.js', 'text/javascript; charset=utf-8'],
    '/src/auto-bid-integration.js': ['src/auto-bid-integration.js', 'text/javascript; charset=utf-8']
};
http.createServer((req, res) => {
    const entry = files[req.url];
    if (!entry) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': entry[1], 'Cache-Control': 'no-store' });
    res.end(fs.readFileSync(path.join(__dirname, '..', entry[0])));
}).listen(8766, '127.0.0.1', () => console.log('Mock hub: http://127.0.0.1:8766/test/auto-bid-harness.html'));
