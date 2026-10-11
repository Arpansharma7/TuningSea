document.addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const desktop = window.tuningSeaDesktop;
  if (!desktop) return;

  if (action === 'import-data') {
    event.preventDefault();
    event.stopImmediatePropagation();
    const file = await desktop.selectDataset();
    if (file) window.toast?.(`${file.name}: quick inspection started.`);
  }

  if (action === 'change-location') {
    event.preventDefault();
    event.stopImmediatePropagation();
    const folder = await desktop.selectStorageLocation();
    if (folder) window.toast?.(`Storage location selected: ${folder}`);
  }
}, true);
