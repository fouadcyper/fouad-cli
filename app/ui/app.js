const $ = selector => document.querySelector(selector);
const form = $('#downloadForm');
const input = $('#mediaUrl');
const panel = $('#jobPanel');
let pollTimer;

async function api(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function loadMeta() {
  const meta = await api('/api/meta');
  $('#version').textContent = `v${meta.version}`;
  $('#platformCount').textContent = meta.platforms.length;
  $('#downloadPath').textContent = meta.downloads.replace(/^\/home\/[^/]+/, '~');
  $('#platformList').innerHTML = meta.platforms.map((name, index) => `<div class="platform" style="--delay:${index * 28}ms"><i>${String(index + 1).padStart(2, '0')}</i><span>${name}</span></div>`).join('');
}

function setJob(status, title, log) {
  panel.hidden = false;
  $('#jobLabel').textContent = status;
  $('#jobTitle').textContent = title;
  $('#jobLog').textContent = log;
}

async function poll(id) {
  clearTimeout(pollTimer);
  const job = await api(`/api/jobs/${id}`);
  const latest = job.log.split('\n').filter(Boolean).slice(-5).join('\n');
  setJob(job.status === 'working' ? 'IN PROGRESS' : job.status.toUpperCase(), job.status === 'working' ? `${job.platform} download` : job.status === 'complete' ? 'Saved to Downloads' : 'Download needs attention', latest);
  if (job.status === 'working') pollTimer = setTimeout(() => poll(id), 900);
  else {
    $('#spinner').style.display = 'none';
    $('#progressBar').style.animation = 'none';
    $('#progressBar').style.width = job.status === 'complete' ? '100%' : '35%';
    $('#progressBar').style.background = job.status === 'complete' ? 'var(--acid)' : '#df745f';
    $('#showResult').hidden = job.status !== 'complete';
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!input.checkValidity()) { setJob('CHECK LINK', 'Paste a complete media URL', 'The link must begin with https:// and belong to a supported platform.'); input.focus(); return; }
  $('#spinner').style.display = '';
  $('#showResult').hidden = true;
  $('#progressBar').removeAttribute('style');
  setJob('STARTING', 'Recognizing platform', 'Checking the link and preparing your download…');
  try {
    const job = await api('/api/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: input.value }) });
    poll(job.id);
  } catch (error) {
    $('#spinner').style.display = 'none';
    setJob('CHECK LINK', 'Could not start download', error.message);
  }
});

$('#pasteButton').addEventListener('click', async () => { try { input.value = await navigator.clipboard.readText(); input.focus(); } catch { input.focus(); } });
async function openDownloads() { await api('/api/open-downloads', { method: 'POST' }); }
$('#openFolder').addEventListener('click', openDownloads);
$('#openFolderSecondary').addEventListener('click', openDownloads);
$('#showResult').addEventListener('click', openDownloads);
loadMeta().catch(error => setJob('OFFLINE', 'App service unavailable', error.message));
