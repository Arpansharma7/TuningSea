const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const defaults = {
  projects: [
    { id: 1, name: 'Customer Support Assistant', goal: 'Answer product questions using company knowledge.', model: 'Llama 3.1 8B', data: 'support-chats.jsonl', status: 'READY TO TRAIN', updated: '2 HOURS AGO' },
    { id: 2, name: 'Brand Voice Model', goal: 'Write concise launch copy in the company voice.', model: 'Qwen 2.5 7B', data: 'brand-library.csv', status: 'DATASET REVIEW', updated: '1 DAY AGO' },
    { id: 3, name: 'Research Extractor', goal: 'Extract structured facts from technical papers.', model: 'Mistral 7B', data: 'research-notes.jsonl', status: 'COMPLETE', updated: '3 DAYS AGO' }
  ],
  route: 'projects',
  theme: 'dark',
  settings: { localOnly: true, telemetry: false, checkpoints: true, temperature: true },
  training: { running: false, progress: 68, step: 1420, loss: .842 }
};

const saved = JSON.parse(localStorage.getItem('tuningsea-state') || 'null');
const state = { ...defaults, ...saved, settings: { ...defaults.settings, ...(saved?.settings || {}) }, training: { ...defaults.training, ...(saved?.training || {}), running: false } };
let trainingTimer = null;
let hasRendered = false;
const save = () => localStorage.setItem('tuningsea-state', JSON.stringify(state));
const statusClass = status => status === 'COMPLETE' ? 'complete' : status.includes('NOT') ? 'blocked' : '';

function tickClock() {
  $('#clock').textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}
tickClock(); setInterval(tickClock, 1000);

function applyTheme(theme = state.theme) {
  state.theme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme;
  const toggle = $('#theme-toggle');
  const label = $('#theme-label');
  if (toggle) {
    const light = state.theme === 'light';
    toggle.setAttribute('aria-pressed', String(light));
    toggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    label.textContent = light ? 'Dark theme' : 'Light theme';
  }
  save();
}
applyTheme();

function pageHead(section, title, copy, action = '') {
  return `<header class="page-head"><div><div class="eyebrow">${section}</div><h1>${title}</h1><p>${copy}</p></div>${action}</header>`;
}
function button(text, action, type = '') { return `<button class="button ${type}" data-action="${action}">${text}</button>`; }
function meter(value, gradient = false, label = 'Progress') { return `<div class="meter ${gradient ? 'gradient' : ''}" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value)}"><i style="width:${value}%"></i></div>`; }
function info(label, text) { return `<button class="info" type="button" aria-label="About ${label}" data-tooltip="${text}">i</button>`; }
function statusText(status) { return ({ 'READY TO TRAIN': 'Ready', 'DATASET REVIEW': 'Needs review', 'COMPLETE': 'Done', 'SETUP': 'Needs setup', 'READY': 'Ready', 'REVIEW': 'Needs review', 'CLEAN': 'Ready', 'ADJUSTMENTS': 'Needs small adjustments' })[status] || status; }
function machineSense() {
  return `<section class="card">
    <div class="label">Your computer</div>
    <div class="verdict"><span class="verdict-mark"></span><div><strong class="bright">Ready to train</strong><div class="muted">Your computer can safely run the recommended setup.</div></div></div>
    <div class="metric"><div class="row"><span>Graphics memory (VRAM) ${info('graphics memory', 'Memory on your graphics card used while training.')}</span><span>6.8 / 12 GB</span></div>${meter(57, false, 'Graphics memory use: 57%')}</div>
    <div class="metric"><div class="row"><span>Memory (RAM) ${info('memory', 'System memory available to TuningSea and other apps.')}</span><span>11.2 / 32 GB</span></div>${meter(35, false, 'System memory use: 35%')}</div>
    <div class="metric"><div class="row"><span>Free storage</span><span>186 GB</span></div>${meter(72, false, 'Storage capacity available: 72%')}</div>
  </section>`;
}

const views = {
  projects() {
    return `<div class="page">
      ${pageHead('Your workspace', 'Projects', 'Build, train, evaluate, and keep every local model version together.', button('New project', 'new-project'))}
      <div class="grid">
        <section class="card span-12 hero-panel hero-wordmark-card">
          <div class="chrome-word wordmark">Tuning Sea</div>
        </section>
        <section class="card span-8">
          <div class="card-head"><div><div class="label">Next step</div><h2>Train Customer Support Assistant</h2></div><span class="status complete">Ready</span></div>
          <p class="muted">Your dataset and model are ready. Review the recommended settings, then start training.</p>
          <div class="steps project-steps" aria-label="Project setup steps"><div class="step done">✓ Add data</div><div class="step done">✓ Pick model</div><div class="step active">3 Train</div><div class="step">4 Evaluate</div><div class="step">5 Export</div></div>
          ${button('Review and train →', 'open-project:1')}
        </section>
        ${machineSense()}
        <section class="card span-12">
          <div class="card-head"><div><div class="label">Projects on this computer</div><h2>${state.projects.length} projects</h2></div><span class="pill">Stored locally</span></div>
          ${state.projects.length ? state.projects.map(p => `<div class="project-row">
            <div><div class="item-title">${p.name}</div><div class="muted">${p.goal}</div><div class="meta">${p.model} / ${p.data}</div></div>
            <div><span class="status ${statusClass(p.status)}">${statusText(p.status)}</span><div class="meta">Updated ${p.updated.toLowerCase()}</div></div>
            <div>${meter(p.status === 'COMPLETE' ? 100 : p.status === 'READY TO TRAIN' ? 72 : 38, true, `${p.name} progress`)}<div class="meta">${p.status === 'COMPLETE' ? 'Done · 100%' : p.status === 'READY TO TRAIN' ? 'Ready to train · 72%' : 'Review data · 38%'}</div></div>
            ${button('Open', `open-project:${p.id}`, 'ghost small')}
          </div>`).join('') : `<div class="empty-state"><div><h3>No projects yet</h3><p>Create a project to prepare your data, choose a model, and train locally.</p>${button('Create your first project', 'new-project')}</div></div>`}
        </section>
      </div>
    </div>`;
  },

  data() {
    const sets = [
      ['support-chats.jsonl', '4,213 examples', 'About 1.8M tokens', 'READY'],
      ['brand-library.csv', '8,421 examples', 'About 3.2M tokens', 'REVIEW'],
      ['research-notes.jsonl', '2,104 examples', 'About 940K tokens', 'CLEAN']
    ];
    return `<div class="page">
      ${pageHead('Training data', 'Data', 'Add examples for the behavior you want your model to learn. TuningSea checks each file before making changes.', button('Import data', 'import-data'))}
      <div class="grid">
        <section class="card span-8">
          <div class="card-head"><div><div class="label">Datasets</div><h2>Files on this computer</h2></div><span class="pill">3 files</span></div>
          ${sets.map(s => `<div class="data-row"><div><div class="item-title">${s[0]}</div><div class="meta">Your original file is kept untouched</div></div><div>${s[1]}</div><div>${s[2]} ${info('tokens', 'Tokens are small pieces of text that models process while training.')}</div><span class="status ${s[3] === 'CLEAN' || s[3] === 'READY' ? 'complete' : ''}">${statusText(s[3])}</span></div>`).join('')}
        </section>
        <section class="card">
          <div class="label">Data quality</div><div class="big">94 / 100</div><p class="muted">Good overall. Review possible issues before training.</p>
          <div class="metric"><div class="row"><span>Usable examples</span><span>98.2%</span></div>${meter(98, false, 'Usable examples: 98.2%')}</div>
          <div class="metric"><div class="row"><span>Possible duplicates</span><span>1.1%</span></div>${meter(11, false, 'Possible duplicates: 1.1%')}</div>
          <div class="metric"><div class="row"><span>Unusually long examples</span><span>0.7%</span></div>${meter(7, false, 'Unusually long examples: 0.7%')}</div>
          ${button('Review 76 possible issues', 'review-data', 'ghost full')}
        </section>
        <section class="card span-12"><div class="label">Example length</div>${chart([70,95,130,165,150,122,92,64,45,27,18,10], { x: 'Length in tokens', y: 'Examples', takeaway: 'Most examples are short enough to train efficiently.' })}</section>
      </div>
    </div>`;
  },

  models() {
    const models = [
      ['Llama 3.1 8B', 'General assistant', 'Strong', 'READY', 'Fits comfortably in 12 GB graphics memory.'],
      ['Qwen 2.5 7B', 'Languages and code', 'Strong', 'READY', 'Good multilingual support with safe memory use.'],
      ['Mistral 7B', 'Extraction and Q&A', 'Fast', 'READY', 'Fastest training option for structured tasks.'],
      ['Gemma 2 9B', 'Writing and reasoning', 'High', 'ADJUSTMENTS', 'Needs a shorter context and smaller batch size.']
    ];
    return `<div class="page">
      ${pageHead('Choose a base model', 'Models', 'Compare practical strengths and select a model that fits your goal and computer.')}
      <div class="grid">
        <section class="card span-8"><div class="label">Compatible with your computer</div>${models.map((m,i) => `<div class="model-row"><div><div class="item-title">${m[0]}</div><div class="meta">${m[1]}</div><div class="muted">${m[4]}</div></div><div><span class="label">Expected quality</span><div>${m[2]}</div></div><div><span class="status ${i < 3 ? 'complete' : 'blocked'}">${statusText(m[3])}</span></div>${button('Select', `select-model:${m[0]}`, i === 0 ? 'small' : 'ghost small')}</div>`).join('')}</section>
        <section class="card"><div class="label">Recommended</div><h2>Llama 3.1 8B</h2><p>Best balance of output quality, training speed, and memory use for this computer.</p><div class="metric"><div class="row"><span>Graphics memory needed</span><strong>About 8.1 GB</strong></div>${meter(68, false, 'Estimated graphics memory use: 68%')}</div><p class="muted">TuningSea will use a memory-saving training method ${info('memory-saving training', 'QLoRA trains a small adapter while keeping the base model compact at 4-bit precision.')}</p>${button('Select recommended model', 'select-model:Llama 3.1 8B', 'full')}</section>
      </div>
    </div>`;
  },

  runs() {
    const t = state.training;
    return `<div class="page">
      ${pageHead('Training', 'Runs', 'Follow active training, review saved recovery points, and pause safely when needed.')}
      <div class="grid">
        <section class="card span-8"><div class="card-head"><div><div class="label">Brand Voice Model</div><h2>${t.running ? 'Training in progress' : t.progress >= 100 ? 'Training complete' : 'Ready to resume'}</h2></div><div class="big">${Math.floor(t.progress)}%</div></div>
          <div class="label">Training · step 3 of 6 · ${Math.floor(t.progress)}%</div>${meter(t.progress, true, `Training progress: ${Math.floor(t.progress)}%`)}<div class="row meta"><span>Update ${t.step} of 2100</span><span>${Math.max(0, Math.ceil((100-t.progress)*.42))} minutes remaining</span></div>
          <div class="steps"><div class="step done">✓ Load model</div><div class="step done">✓ Prepare data</div><div class="step active">3 Train</div><div class="step">4 Validate</div><div class="step">5 Save</div><div class="step">6 Done</div></div>
          <div class="row"><span class="status ${t.running ? 'complete' : ''}">${t.running ? 'Running' : 'Paused'}</span><div>${button(t.running ? 'Pause' : 'Resume training', 'toggle-training', t.running ? 'ghost' : '')} ${button('Stop', 'stop-training', 'danger')}</div></div>
        </section>
        <section class="card"><div class="label">RTX 3060</div><div class="metric"><div class="row"><span>Graphics memory (VRAM) ${info('graphics memory', 'Memory on your graphics card used during training.')}</span><span>8.1 / 12 GB</span></div>${meter(68, false, 'Graphics memory use: 68%')}</div><div class="metric"><div class="row"><span>GPU usage ${info('GPU usage', 'How much of the graphics processor is currently being used.')}</span><span>${t.running ? 94 : 2}%</span></div>${meter(t.running ? 94 : 2, false, `GPU usage: ${t.running ? 94 : 2}%`)}</div><div class="metric"><div class="row"><span>GPU temperature ${info('GPU temperature', 'Training pauses automatically if the graphics card becomes too hot.')}</span><span>${t.running ? 71 : 39}°C</span></div>${meter(t.running ? 71 : 39, false, `GPU temperature: ${t.running ? 71 : 39} degrees Celsius`)}</div></section>
        <section class="card span-8"><div class="label">Training loss${t.running ? ' · Live' : ''}</div>${chart([2.1,1.8,1.55,1.31,1.18,1.04,.98,.91,.87,t.loss], { x: 'Training updates', y: 'Loss', takeaway: 'Loss is falling steadily, which means the model is learning.' })}</section>
        <section class="card"><div class="label">Training details</div><div class="big">${t.loss.toFixed(3)}</div><div class="muted">Current loss ${info('training loss', 'A lower training loss usually means the model is learning the examples more closely.')}</div><div class="metric"><div class="row"><span>Learning rate</span><span>2e-4</span></div></div><div class="metric"><div class="row"><span>Pass through data</span><span>2 of 3</span></div></div><div class="metric"><div class="row"><span>Latest recovery point ${info('recovery point', 'A saved checkpoint lets you resume after an interruption.')}</span><span>Update 1400</span></div></div></section>
        <section class="card span-12"><div class="label">Detailed activity</div><pre class="log" id="run-log">&gt; Loaded Llama 3.1 8B using reduced memory\n&gt; Applied memory-saving adapter training\n&gt; Loaded brand-library with 8,421 examples\n&gt; Saved a recovery point at update 1400\n&gt; Update ${t.step} · loss ${t.loss.toFixed(3)}</pre></section>
      </div>
    </div>`;
  },

  evaluation() {
    return `<div class="page">
      ${pageHead('Compare results', 'Evaluation', 'Check whether training improved the behavior you care about before keeping this version.', button('Run test', 'run-eval'))}
      <div class="grid">
        <section class="card span-12"><div class="field"><label for="test-prompt">Test prompt</label><textarea id="test-prompt">Write a concise reply to a customer asking whether they can export their trained adapter for local use.</textarea></div></section>
        <section class="card span-12"><div class="compare"><div><div class="label">Original model</div><div class="response" id="base-response">Yes, you may be able to export the adapter depending on the software and model format you used. Check the documentation for compatibility details.</div></div><div><div class="label">Trained model</div><div class="response" id="tuned-response">Yes. Open Library, select the completed version, then choose Export adapter. TuningSea keeps the original model unchanged and shows the exact output location before export.</div></div></div></section>
        <section class="card"><div class="label">Intent match</div><div class="big">91%</div>${meter(91, true, 'Intent match: 91%')}<p class="takeaway"><strong>Good:</strong> answers what was asked.</p></section>
        <section class="card"><div class="label">Format consistency</div><div class="big">96%</div>${meter(96, true, 'Format consistency: 96%')}<p class="takeaway"><strong>Good:</strong> reliably follows the requested structure.</p></section>
        <section class="card"><div class="label">Memorization risk</div><div class="big">Low</div>${meter(18, false, 'Memorization risk: low')}<p class="takeaway"><strong>Good:</strong> no strong signs of copying training examples.</p></section>
      </div>
    </div>`;
  },

  library() {
    return `<div class="page">
      ${pageHead('Saved models', 'Library', 'Use completed model versions locally, evaluate them, or export them to another tool.')}
      <div class="grid"><section class="card span-12">
        <div class="library-row"><div><div class="item-title">Research Extractor · Version 3</div><div class="meta">Mistral 7B · LoRA adapter ${info('LoRA adapter', 'A small trained file that works with the original base model.')}</div></div><div>Adapter · 164 MB</div><div><span class="status complete">Done</span><div class="meta">Evaluated · stored locally</div></div>${button('Export', 'export-model', 'small')}</div>
        <div class="library-row"><div><div class="item-title">Support Assistant · Version 1</div><div class="meta">Llama 3.1 8B · memory-saving training</div></div><div>Recovery point · 4.2 GB</div><div><span class="status">Needs review</span></div>${button('Evaluate', 'go-evaluation', 'ghost small')}</div>
      </section><section class="card span-8"><div class="label">Local chat · Research Extractor Version 3</div><div class="response">Ready. Ask a question about your model or test a structured extraction.</div><div class="field" style="margin-top:10px"><label for="library-message">Test message</label><input id="library-message" placeholder="Ask the model a question"></div></section><section class="card"><div class="label">Export formats</div><p class="muted">Choose where or how you want to use this model.</p><div class="export-options"><button class="export-option" data-action="export-model"><strong>LoRA</strong><span>Use with the original base model</span></button><button class="export-option" data-action="export-model"><strong>GGUF</strong><span>Use with compatible local apps</span></button><button class="export-option" data-action="export-model"><strong>Ollama</strong><span>Run directly in Ollama</span></button><button class="export-option" data-action="export-model"><strong>Safetensors</strong><span>Save a merged model file</span></button><button class="export-option" data-action="export-model"><strong>Local API</strong><span>Connect another app on this computer</span></button></div></section></div>
    </div>`;
  },

  settings() {
    return `<div class="page">
      ${pageHead('App preferences', 'Settings', 'Manage this computer, privacy, storage, and training recovery.')}
      <div class="grid">${machineSense()}<section class="card span-8"><div class="label">Privacy and reliability</div>
        ${setting('localOnly','Keep processing local','Never upload datasets without explicit permission.')}
        ${setting('telemetry','Share anonymous usage data','Share basic usage and stability information. Datasets are never included.')}
        ${setting('checkpoints','Save recovery points automatically','Save training progress so interrupted runs can resume.')}
        ${setting('temperature','Protect against high temperatures','Pause training if the graphics card becomes too hot.')}
      </section><section class="card span-12"><div class="card-head"><div><div class="label">Storage location</div><h2>D:\\TUNINGSEA</h2></div>${button('Change location', 'change-location')}</div><div class="project-row"><div><div class="item-title">Datasets</div><div class="meta">D:\\TUNINGSEA\\DATA</div></div><div>12.4 GB</div><div>${meter(18, false, 'Dataset storage use: 18%')}</div><span></span></div><div class="project-row"><div><div class="item-title">Models and recovery points</div><div class="meta">D:\\TUNINGSEA\\MODELS</div></div><div>57.8 GB</div><div>${meter(42, false, 'Model storage use: 42%')}</div><span></span></div></section></div>
    </div>`;
  }
};

function setting(key, title, copy) { return `<div class="setting-row"><div><div class="item-title">${title}</div><div class="muted">${copy}</div></div><button class="toggle ${state.settings[key] ? 'on' : ''}" data-action="toggle-setting:${key}" aria-label="Toggle ${title}" aria-pressed="${state.settings[key]}"><i></i></button></div>`; }
function chart(values, options = {}) {
  const max = Math.max(...values), min = Math.min(...values);
  const points = values.map((v, i) => ({ x: 34 + i/(values.length-1)*548, y: 160-(v-min)/(max-min || 1)*125, v }));
  const pts = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return `<figure class="chart-wrap"><svg class="chart" viewBox="0 0 600 190" role="img" aria-label="${options.y || 'Value'} by ${options.x || 'step'}"><g class="chart-grid"><path d="M34 35H582M34 77H582M34 119H582M34 160H582M171 20V160M308 20V160M445 20V160"/></g><polyline class="chart-line" points="${pts}"/>${points.map((p,i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="transparent" tabindex="0"><title>${options.x || 'Point'} ${i + 1}: ${p.v}</title></circle>`).join('')}<text class="chart-axis" x="34" y="182">${options.x || ''}</text><text class="chart-axis" x="8" y="16">${options.y || ''}</text></svg>${options.takeaway ? `<figcaption class="takeaway">${options.takeaway}</figcaption>` : ''}</figure>`;
}

function render(route = state.route) {
  state.route = views[route] ? route : 'projects'; save();
  $('#view').innerHTML = views[state.route]();
  $$('.nav-item').forEach(n => {
    const active = n.dataset.route === state.route;
    n.classList.toggle('active', active);
    if (active) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
  });
  if (hasRendered) $('#view').focus({ preventScroll: true });
  hasRendered = true;
}
function navigate(route) { render(route); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2400); }
function openModal(html) { $('#modal-content').innerHTML = html; $('#modal').showModal(); }
function closeModal() { $('#modal').close(); }

function newProjectModal() {
  openModal(`<div class="label">New project</div><h2>What do you want to build?</h2><div class="stack">
    <div class="field"><label for="project-name">Project name</label><input id="project-name" required placeholder="Customer support assistant"></div>
    <div class="field"><label for="project-goal">Goal</label><textarea id="project-goal" required placeholder="Describe the behavior you want the model to learn."></textarea></div>
    <div class="field"><label for="project-model">Recommended starting model</label><select id="project-model"><option>Llama 3.1 8B</option><option>Qwen 2.5 7B</option><option>Mistral 7B</option></select></div>
  </div><div class="modal-actions"><button class="button ghost" value="cancel">Cancel</button><button class="button" type="button" data-action="create-project">Create project</button></div>`);
}
function importDataModal() {
  openModal(`<div class="label">Import data · stays local</div><h2>Add a dataset</h2><label class="dropzone"><input id="dataset-file" type="file" hidden accept=".jsonl,.json,.csv,.txt"><span><strong>Drop a file or choose from this computer</strong><br><span class="muted">JSONL, JSON, CSV, or TXT. Your original file is kept untouched.</span></span></label><div class="modal-actions"><button class="button ghost" value="cancel">Cancel</button></div>`);
}
function startTraining() {
  if (state.training.running) return;
  state.training.running = true; save(); render('runs');
  trainingTimer = setInterval(() => {
    state.training.progress = Math.min(100, state.training.progress + .35);
    state.training.step = Math.min(2100, state.training.step + 7);
    state.training.loss = Math.max(.36, state.training.loss * .996 + (Math.random() - .5) * .008);
    if (state.training.progress >= 100) { state.training.running = false; clearInterval(trainingTimer); toast('RUN COMPLETE / CHECKPOINT SAVED'); }
    save(); if (state.route === 'runs') render('runs');
  }, 900);
}
function pauseTraining() { state.training.running = false; clearInterval(trainingTimer); save(); render('runs'); toast('RUN PAUSED SAFELY'); }

document.addEventListener('click', e => {
  if (e.target.closest('#theme-toggle')) return applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  const route = e.target.closest('[data-route]')?.dataset.route;
  if (route) return navigate(route);
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'new-project') newProjectModal();
  else if (action === 'import-data') importDataModal();
  else if (action === 'create-project') {
    const name = $('#project-name').value.trim(), goal = $('#project-goal').value.trim();
    if (!name || !goal) return toast('Add a project name and goal to continue.');
    state.projects.unshift({ id: Date.now(), name, goal, model: $('#project-model').value, data: 'NO DATASET', status: 'SETUP', updated: 'JUST NOW' }); save(); closeModal(); render('projects'); toast('Project created on this computer.');
  } else if (action.startsWith('open-project:')) navigate('data');
  else if (action.startsWith('select-model:')) toast(`${action.split(':')[1]} selected.`);
  else if (action === 'review-data') toast('76 possible issues are ready to review.');
  else if (action === 'toggle-training') state.training.running ? pauseTraining() : startTraining();
  else if (action === 'stop-training') { if (!window.confirm('Stop this training run? Your latest recovery point will be kept.')) return; pauseTraining(); state.training.progress = 0; state.training.step = 0; save(); render('runs'); toast('Training stopped. Latest recovery point kept.'); }
  else if (action === 'run-eval') { $('#tuned-response').textContent = 'Running local comparison…'; setTimeout(() => { if ($('#tuned-response')) $('#tuned-response').textContent = 'Yes. Open Library, select the completed version, then choose Export adapter. Your data and original model remain unchanged.'; toast('EVALUATION COMPLETE'); }, 700); }
  else if (action === 'export-model') toast('Export prepared successfully · 164 MB.');
  else if (action === 'go-evaluation') navigate('evaluation');
  else if (action === 'change-location') toast('STORAGE LOCATION PICKER WOULD OPEN HERE');
  else if (action.startsWith('toggle-setting:')) { const key = action.split(':')[1]; state.settings[key] = !state.settings[key]; save(); render('settings'); }
});

document.addEventListener('change', e => {
  if (e.target.id === 'dataset-file' && e.target.files[0]) { const file = e.target.files[0]; closeModal(); toast(`${file.name}: quick inspection started.`); }
});

render();
