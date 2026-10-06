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
    toggle.setAttribute('aria-label', light ? 'Switch to night theme' : 'Switch to day theme');
    label.textContent = light ? 'NIGHT' : 'DAY';
  }
  save();
}
applyTheme();

function pageHead(code, title, copy, action = '') {
  return `<header class="page-head"><div><div class="eyebrow">${code}</div><h1>${title}</h1><p>${copy}</p></div>${action}</header>`;
}
function button(text, action, type = '') { return `<button class="button ${type}" data-action="${action}">${text}</button>`; }
function meter(value, gradient = false) { return `<div class="meter ${gradient ? 'gradient' : ''}"><i style="width:${value}%"></i></div>`; }
function machineSense() {
  return `<section class="card">
    <div class="label">MACHINE SENSE / LOCAL PROFILE</div>
    <div class="verdict"><span class="verdict-mark"></span><div><strong class="bright">SYSTEM READY</strong><div class="muted">SAFE FOR RECOMMENDED RUNS</div></div></div>
    <div class="metric"><div class="row"><span>VRAM</span><span>6.8 / 12 GB</span></div>${meter(57)}</div>
    <div class="metric"><div class="row"><span>RAM</span><span>11.2 / 32 GB</span></div>${meter(35)}</div>
    <div class="metric"><div class="row"><span>STORAGE</span><span>186 GB FREE</span></div>${meter(72)}</div>
    <div class="barcode"></div>
  </section>`;
}

const views = {
  projects() {
    return `<div class="page">
      ${pageHead('WORKSPACE / 01', 'Projects', 'Build, train, evaluate, and keep every local model version together.', button('+ NEW PROJECT', 'new-project'))}
      <div class="grid">
        <section class="card span-8 hero-panel hero-wordmark-card">
          <div class="label">LOCAL FINE-TUNING / COMMAND CENTER</div><span class="visual-index">SYSTEM / 01</span>
          <div class="chrome-word wordmark">Tuning Sea</div>
        </section>
        ${machineSense()}
        <section class="card span-12">
          <div class="card-head"><div><div class="label">ACTIVE PROJECTS</div><h2>${state.projects.length} PROJECTS</h2></div><span class="pill">LOCAL ONLY</span></div>
          ${state.projects.map(p => `<div class="project-row">
            <div><div class="item-title">${p.name}</div><div class="muted">${p.goal}</div><div class="meta">${p.model} / ${p.data}</div></div>
            <div><span class="status ${statusClass(p.status)}">${p.status}</span><div class="meta">UPDATED ${p.updated}</div></div>
            <div>${meter(p.status === 'COMPLETE' ? 100 : p.status === 'READY TO TRAIN' ? 72 : 38, true)}<div class="meta">PIPELINE PROGRESS</div></div>
            ${button('OPEN →', `open-project:${p.id}`, 'ghost small')}
          </div>`).join('')}
        </section>
      </div>
    </div>`;
  },

  data() {
    const sets = [
      ['support-chats.jsonl', '4,213 EXAMPLES', '1.8M TOKENS', 'READY'],
      ['brand-library.csv', '8,421 EXAMPLES', '3.2M TOKENS', 'REVIEW'],
      ['research-notes.jsonl', '2,104 EXAMPLES', '940K TOKENS', 'CLEAN']
    ];
    return `<div class="page">
      ${pageHead('DATA PIPELINE / 02', 'Data', 'Inspect structure first. Clean and transform only after Machine Sense confirms feasibility.', button('+ IMPORT DATA', 'import-data'))}
      <div class="grid">
        <section class="card span-8">
          <div class="card-head"><div><div class="label">DATASETS</div><h2>LOCAL SOURCES</h2></div><span class="pill">3 FILES</span></div>
          ${sets.map(s => `<div class="data-row"><div><div class="item-title">${s[0]}</div><div class="meta">ORIGINAL PRESERVED</div></div><div>${s[1]}</div><div>${s[2]}</div><span class="status ${s[3] === 'CLEAN' ? 'complete' : ''}">${s[3]}</span></div>`).join('')}
        </section>
        <section class="card">
          <div class="label">DATA HEALTH / ACTIVE</div><div class="big">94 / 100</div>
          <div class="metric"><div class="row"><span>VALID RECORDS</span><span>98.2%</span></div>${meter(98)}</div>
          <div class="metric"><div class="row"><span>DUPLICATES</span><span>1.1%</span></div>${meter(11)}</div>
          <div class="metric"><div class="row"><span>LONG EXAMPLES</span><span>0.7%</span></div>${meter(7)}</div>
          ${button('REVIEW 76 FLAGS', 'review-data', 'ghost full')}
        </section>
        <section class="card span-12"><div class="label">TOKEN LENGTH DISTRIBUTION</div>${chart([70,95,130,165,150,122,92,64,45,27,18,10])}</section>
      </div>
    </div>`;
  },

  models() {
    const models = [
      ['LLAMA 3.1 8B', 'GENERAL ASSISTANT', 'STRONG', 'READY'],
      ['QWEN 2.5 7B', 'MULTILINGUAL + CODE', 'STRONG', 'READY'],
      ['MISTRAL 7B', 'EXTRACTION + QA', 'FAST', 'READY'],
      ['GEMMA 2 9B', 'WRITING + REASONING', 'HIGH', 'ADJUSTMENTS']
    ];
    return `<div class="page">
      ${pageHead('MODEL CATALOG / 03', 'Models', 'Curated local models described by what they can do—not by infrastructure jargon.')}
      <div class="grid">
        <section class="card span-8"><div class="label">COMPATIBLE WITH THIS MACHINE</div>${models.map((m,i) => `<div class="model-row"><div><div class="item-title">${m[0]}</div><div class="meta">${m[1]}</div></div><div><span class="label">EXPECTED QUALITY</span><div>${m[2]}</div></div><div><span class="status ${i < 3 ? 'complete' : ''}">${m[3]}</span></div>${button('SELECT', `select-model:${m[0]}`, 'ghost small')}</div>`).join('')}</section>
        <section class="card grid-bg hero-panel"><div class="label">RECOMMENDATION / 01</div><div class="chrome-word" style="font-size:72px">8B</div><div><h2>LLAMA 3.1</h2><p class="muted">Best balance of output quality, speed, and 12 GB VRAM compatibility.</p><div><span class="pill">4-BIT</span><span class="pill">QLORA</span><span class="pill">LOCAL</span></div></div></section>
      </div>
    </div>`;
  },

  runs() {
    const t = state.training;
    return `<div class="page">
      ${pageHead('TRAINING OPS / 04', 'Runs', 'A focused, low-overhead view of active training and recoverable checkpoints.')}
      <div class="grid">
        <section class="card span-8"><div class="card-head"><div><div class="label">MISSION: FT-04 / BRAND VOICE</div><h2>${t.running ? 'TRAINING IN PROGRESS' : t.progress >= 100 ? 'RUN COMPLETE' : 'READY TO RESUME'}</h2></div><div class="big">${Math.floor(t.progress)}%</div></div>
          ${meter(t.progress, true)}<div class="row meta"><span>STEP ${t.step} / 2100</span><span>EST. ${Math.max(0, Math.ceil((100-t.progress)*.42))} MIN REMAINING</span></div>
          <div class="steps"><div class="step done">01 LOAD</div><div class="step done">02 PREP</div><div class="step active">03 TRAIN</div><div class="step">04 VALIDATE</div><div class="step">05 SAVE</div><div class="step">06 COMPLETE</div></div>
          <div class="row"><span class="status ${t.running ? 'complete' : ''}">${t.running ? 'PROCESS ACTIVE' : 'PROCESS PAUSED'}</span><div>${button(t.running ? 'PAUSE' : 'RESUME', 'toggle-training', 'ghost')} ${button('STOP', 'stop-training', 'danger')}</div></div>
        </section>
        <section class="card"><div class="label">CHIP MODEL: RTX 3060</div><div class="metric"><div class="row"><span>VRAM</span><span>8.1 / 12 GB</span></div>${meter(68)}</div><div class="metric"><div class="row"><span>UTIL</span><span>${t.running ? 94 : 2}%</span></div>${meter(t.running ? 94 : 2)}</div><div class="metric"><div class="row"><span>TEMP</span><span>${t.running ? 71 : 39}°C</span></div>${meter(t.running ? 71 : 39)}</div><div class="barcode"></div></section>
        <section class="card span-8"><div class="label">LOSS CURVE / LIVE</div>${chart([2.1,1.8,1.55,1.31,1.18,1.04,.98,.91,.87,t.loss])}</section>
        <section class="card"><div class="label">RUN METRICS</div><div class="big">${t.loss.toFixed(3)}</div><div class="muted">TRAIN LOSS</div><div class="metric"><div class="row"><span>LEARNING RATE</span><span>2E-4</span></div></div><div class="metric"><div class="row"><span>EPOCH</span><span>2 / 3</span></div></div><div class="metric"><div class="row"><span>CHECKPOINT</span><span>STEP 1400</span></div></div></section>
        <section class="card span-12"><div class="label">TELEMETRY</div><pre class="log" id="run-log">&gt; loaded Llama 3.1 8B [4-bit]\n&gt; applied QLoRA r=16 alpha=32\n&gt; dataset brand-library / 8,421 examples\n&gt; checkpoint saved at step 1400\n&gt; step ${t.step}  loss ${t.loss.toFixed(3)}</pre></section>
      </div>
    </div>`;
  },

  evaluation() {
    return `<div class="page">
      ${pageHead('QUALITY CONTROL / 05', 'Evaluation', 'Compare the base and tuned model against the behavior you intended to improve.', button('RUN TEST', 'run-eval'))}
      <div class="grid">
        <section class="card span-12"><div class="field"><label for="test-prompt">TEST PROMPT / 04</label><textarea id="test-prompt">Write a concise reply to a customer asking whether they can export their trained adapter for local use.</textarea></div></section>
        <section class="card span-12"><div class="compare"><div><div class="label">BASE MODEL</div><div class="response" id="base-response">Yes, you may be able to export the adapter depending on the software and model format you used. Check the documentation for compatibility details.</div></div><div><div class="label">TUNED MODEL</div><div class="response" id="tuned-response">Yes. Open Library, select the completed version, then choose Export adapter. TuningSea keeps the original model unchanged and shows the exact output location before export.</div></div></div></section>
        <section class="card"><div class="label">INTENT MATCH</div><div class="big">91%</div>${meter(91, true)}</section>
        <section class="card"><div class="label">FORMAT CONSISTENCY</div><div class="big">96%</div>${meter(96, true)}</section>
        <section class="card"><div class="label">MEMORIZATION RISK</div><div class="big">LOW</div>${meter(18)}</section>
      </div>
    </div>`;
  },

  library() {
    return `<div class="page">
      ${pageHead('OUTPUT ARCHIVE / 06', 'Library', 'Finished adapters and model versions, ready for local use or export.')}
      <div class="grid"><section class="card span-12">
        <div class="library-row"><div><div class="item-title">RESEARCH EXTRACTOR / V3</div><div class="meta">MISTRAL 7B + LORA / COMPLETED 3 DAYS AGO</div></div><div>ADAPTER / 164 MB</div><div><span class="pill">VERIFIED</span><span class="pill">LOCAL</span></div>${button('EXPORT', 'export-model', 'ghost small')}</div>
        <div class="library-row"><div><div class="item-title">SUPPORT ASSISTANT / V1</div><div class="meta">LLAMA 3.1 8B + QLORA / DRAFT</div></div><div>CHECKPOINT / 4.2 GB</div><div><span class="pill">UNEVALUATED</span></div>${button('EVALUATE', 'go-evaluation', 'ghost small')}</div>
      </section><section class="card span-8"><div class="label">LOCAL CHAT / RESEARCH EXTRACTOR V3</div><div class="response">Ready. Ask a question about your model or test a structured extraction.</div><div class="field" style="margin-top:10px"><input placeholder="TYPE A TEST MESSAGE..." aria-label="Test message"></div></section><section class="card"><div class="label">EXPORT TARGETS</div><div class="stack"><span class="pill">LORA ADAPTER</span><span class="pill">GGUF</span><span class="pill">OLLAMA</span><span class="pill">SAFETENSORS</span><span class="pill">LOCAL API</span></div><div class="barcode"></div></section></div>
    </div>`;
  },

  settings() {
    return `<div class="page">
      ${pageHead('SYSTEM CONFIG / 07', 'Settings', 'Hardware, privacy, storage, and recovery controls for this device.')}
      <div class="grid">${machineSense()}<section class="card span-8"><div class="label">PRIVACY + RELIABILITY</div>
        ${setting('localOnly','LOCAL PROCESSING ONLY','Never upload datasets without explicit permission.')}
        ${setting('telemetry','ANONYMOUS PRODUCT TELEMETRY','Share basic usage and stability data. Never includes datasets.')}
        ${setting('checkpoints','AUTOMATIC CHECKPOINTS','Save compatible recovery points during training.')}
        ${setting('temperature','TEMPERATURE PROTECTION','Pause runs when hardware reaches unsafe temperatures.')}
      </section><section class="card span-12"><div class="card-head"><div><div class="label">STORAGE LOCATIONS</div><h2>D:\\TUNINGSEA</h2></div>${button('CHANGE LOCATION', 'change-location', 'ghost')}</div><div class="project-row"><div><div class="item-title">DATASETS</div><div class="meta">D:\\TUNINGSEA\\DATA</div></div><div>12.4 GB</div><div>${meter(18)}</div><span></span></div><div class="project-row"><div><div class="item-title">MODELS + CHECKPOINTS</div><div class="meta">D:\\TUNINGSEA\\MODELS</div></div><div>57.8 GB</div><div>${meter(42)}</div><span></span></div></section></div>
    </div>`;
  }
};

function setting(key, title, copy) { return `<div class="setting-row"><div><div class="item-title">${title}</div><div class="muted">${copy}</div></div><button class="toggle ${state.settings[key] ? 'on' : ''}" data-action="toggle-setting:${key}" aria-label="Toggle ${title}" aria-pressed="${state.settings[key]}"><i></i></button></div>`; }
function chart(values) {
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i/(values.length-1)*600).toFixed(1)},${(165-(v-min)/(max-min || 1)*135).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 600 180" preserveAspectRatio="none" aria-label="Line chart"><g class="chart-grid"><path d="M0 30H600M0 75H600M0 120H600M0 165H600M150 0V180M300 0V180M450 0V180"/></g><polyline class="chart-line" points="${pts}"/></svg>`;
}

function render(route = state.route) {
  state.route = views[route] ? route : 'projects'; save();
  $('#view').innerHTML = views[state.route]();
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.route === state.route));
  $('#view').focus({ preventScroll: true });
}
function navigate(route) { render(route); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2400); }
function openModal(html) { $('#modal-content').innerHTML = html; $('#modal').showModal(); }
function closeModal() { $('#modal').close(); }

function newProjectModal() {
  openModal(`<div class="label">NEW PROJECT / STEP 01</div><h2>WHAT DO YOU WANT TO BUILD?</h2><div class="stack">
    <div class="field"><label for="project-name">Project name</label><input id="project-name" required placeholder="Customer support assistant"></div>
    <div class="field"><label for="project-goal">Goal</label><textarea id="project-goal" required placeholder="Describe the behavior you want the model to learn."></textarea></div>
    <div class="field"><label for="project-model">Recommended starting model</label><select id="project-model"><option>Llama 3.1 8B</option><option>Qwen 2.5 7B</option><option>Mistral 7B</option></select></div>
  </div><div class="modal-actions"><button class="button ghost" value="cancel">CANCEL</button><button class="button" type="button" data-action="create-project">CREATE PROJECT</button></div>`);
}
function importDataModal() {
  openModal(`<div class="label">DATA IMPORT / LOCAL ONLY</div><h2>ADD A DATASET</h2><label class="dropzone"><input id="dataset-file" type="file" hidden accept=".jsonl,.json,.csv,.txt"><span><strong>DROP A FILE OR CHOOSE FROM DEVICE</strong><br><span class="muted">JSONL, JSON, CSV, TXT / ORIGINAL PRESERVED</span></span></label><div class="modal-actions"><button class="button ghost" value="cancel">CANCEL</button></div>`);
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
    if (!name || !goal) return toast('PROJECT NAME AND GOAL ARE REQUIRED');
    state.projects.unshift({ id: Date.now(), name, goal, model: $('#project-model').value, data: 'NO DATASET', status: 'SETUP', updated: 'JUST NOW' }); save(); closeModal(); render('projects'); toast('PROJECT CREATED LOCALLY');
  } else if (action.startsWith('open-project:')) navigate('data');
  else if (action.startsWith('select-model:')) toast(`${action.split(':')[1]} SELECTED`);
  else if (action === 'review-data') toast('76 FLAGS READY FOR REVIEW');
  else if (action === 'toggle-training') state.training.running ? pauseTraining() : startTraining();
  else if (action === 'stop-training') { pauseTraining(); state.training.progress = 0; state.training.step = 0; save(); render('runs'); toast('RUN STOPPED / LAST CHECKPOINT PRESERVED'); }
  else if (action === 'run-eval') { $('#tuned-response').textContent = 'Running local comparison…'; setTimeout(() => { if ($('#tuned-response')) $('#tuned-response').textContent = 'Yes. Open Library, select the completed version, then choose Export adapter. Your data and original model remain unchanged.'; toast('EVALUATION COMPLETE'); }, 700); }
  else if (action === 'export-model') toast('EXPORT PREPARED / 164 MB');
  else if (action === 'go-evaluation') navigate('evaluation');
  else if (action === 'change-location') toast('STORAGE LOCATION PICKER WOULD OPEN HERE');
  else if (action.startsWith('toggle-setting:')) { const key = action.split(':')[1]; state.settings[key] = !state.settings[key]; save(); render('settings'); }
});

document.addEventListener('change', e => {
  if (e.target.id === 'dataset-file' && e.target.files[0]) { const file = e.target.files[0]; closeModal(); toast(`${file.name.toUpperCase()} / LIGHT INSPECTION STARTED`); }
});

render();
