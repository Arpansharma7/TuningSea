const fs = require('node:fs');
const path = require('node:path');

const desktopRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(desktopRoot, '..');
const uiRoot = path.join(desktopRoot, 'ui');

const copyFile = (name) => {
  fs.copyFileSync(path.join(projectRoot, name), path.join(uiRoot, name));
};

fs.rmSync(uiRoot, { recursive: true, force: true });
fs.mkdirSync(uiRoot, { recursive: true });

copyFile('index.html');
copyFile('styles.css');
copyFile('app.js');
fs.cpSync(path.join(projectRoot, 'assets'), path.join(uiRoot, 'assets'), {
  recursive: true
});
fs.copyFileSync(
  path.join(desktopRoot, 'desktop-renderer.js'),
  path.join(uiRoot, 'desktop-renderer.js')
);

const indexPath = path.join(uiRoot, 'index.html');
const index = fs.readFileSync(indexPath, 'utf8').replace(
  '<script src="app.js"></script>',
  '<script src="app.js"></script>\n  <script src="desktop-renderer.js"></script>'
);
fs.writeFileSync(indexPath, index);

console.log('TuningSea interface synchronized.');
