const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { URL } = require('url');
const { PLATFORM_CONFIG, matchPlatform } = require('../utils/config');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(__dirname, 'ui');
const DOWNLOADS = path.join(os.homedir(), 'Downloads', 'Fouad');
const PORT = Number(process.env.FOUAD_APP_PORT || 3939);
const jobs = new Map();

const json = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
};

const clean = value => value.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

function openWindow() {
  if (process.env.FOUAD_NO_OPEN === '1') return;
  const url = `http://127.0.0.1:${PORT}`;
  const browser = process.env.BROWSER || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : 'xdg-open');
  const args = browser.endsWith('chromium')
    ? [`--app=${url}`, '--class=FouadDownloader', '--disable-features=Translate', '--no-first-run', '--window-size=1240,820']
    : [url];
  const child = spawn(browser, args, { detached: true, stdio: 'ignore' });
  child.unref();
}

function serveFile(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = path.resolve(PUBLIC, relative);
  if (!file.startsWith(PUBLIC + path.sep) && file !== path.join(PUBLIC, 'index.html')) return json(res, 403, { error: 'Forbidden' });
  fs.readFile(file, (error, data) => {
    if (error) return json(res, 404, { error: 'Not found' });
    const ext = path.extname(file);
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function startJob(urlValue) {
  const parsed = new URL(urlValue);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use a valid http or https link.');
  const platform = matchPlatform(parsed.hostname.toLowerCase(), urlValue);
  if (!platform) throw new Error('This link is not from a supported platform.');

  fs.mkdirSync(DOWNLOADS, { recursive: true });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job = { id, platform: platform.name, status: 'working', log: 'Reading link…', createdAt: Date.now() };
  jobs.set(id, job);
  const child = spawn(process.execPath, ['index.js', '--path', DOWNLOADS, platform.command, urlValue], {
    cwd: ROOT,
    env: { ...process.env, FORCE_COLOR: '0' },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const append = chunk => {
    job.log = (job.log + '\n' + clean(chunk.toString())).trim().slice(-7000);
    if (/select download option/i.test(job.log)) child.stdin.write('\n');
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);
  const autoPick = setInterval(() => child.stdin.write('\n'), 1800);
  child.on('close', code => {
    clearInterval(autoPick);
    job.status = code === 0 && !/failed|error|unavailable|invalid media/i.test(job.log) ? 'complete' : 'error';
    job.finishedAt = Date.now();
    job.log = clean(job.log);
  });
  child.on('error', error => {
    clearInterval(autoPick);
    job.status = 'error';
    job.log += `\n${error.message}`;
  });
  return job;
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && parsed.pathname === '/api/meta') {
    return json(res, 200, { version: require('../package.json').version, downloads: DOWNLOADS, platforms: PLATFORM_CONFIG.map(p => p.name) });
  }
  if (req.method === 'GET' && parsed.pathname.startsWith('/api/jobs/')) {
    const job = jobs.get(parsed.pathname.split('/').pop());
    return job ? json(res, 200, job) : json(res, 404, { error: 'Job not found' });
  }
  if (req.method === 'POST' && parsed.pathname === '/api/download') {
    let body = '';
    req.on('data', chunk => { if (body.length < 10000) body += chunk; });
    return req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        return json(res, 202, startJob(String(payload.url || '').trim()));
      } catch (error) {
        return json(res, 400, { error: error.message || 'Invalid request.' });
      }
    });
  }
  if (req.method === 'POST' && parsed.pathname === '/api/open-downloads') {
    fs.mkdirSync(DOWNLOADS, { recursive: true });
    const child = spawn('xdg-open', [DOWNLOADS], { detached: true, stdio: 'ignore' });
    child.unref();
    return json(res, 200, { ok: true });
  }
  serveFile(req, res);
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') openWindow();
  else { console.error(error.message); process.exitCode = 1; }
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Fouad app is running at http://127.0.0.1:${PORT}`);
  openWindow();
});
