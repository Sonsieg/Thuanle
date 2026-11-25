const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
// jsPDF already supplies the PNG decoder in the production dependency graph.
const { decode } = require('fast-png');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
const splash = config.plugins.find((entry) => Array.isArray(entry) && entry[0] === 'expo-splash-screen')?.[1];
const assets = [
  ['App icon', config.icon, false],
  ['iOS icon', config.ios.icon, false],
  ['Adaptive foreground', config.android.adaptiveIcon.foregroundImage, true],
  ['Splash', splash?.image, true],
  ['Web favicon', config.web.favicon, false],
];
for (const [label, filename, transparent] of assets) {
  assert.equal(typeof filename, 'string', `${label}: missing file path`);
  const file = path.resolve(root, filename);
  assert.ok(file.startsWith(root + path.sep), `${label}: asset must be inside the project`);
  assert.ok(fs.existsSync(file), `${label}: file does not exist: ${filename}`);
  const image = decode(fs.readFileSync(file));
  assert.equal(image.width, image.height, `${label}: must be square`);
  assert.ok(image.width >= 1024, `${label}: master asset must be at least 1024px`);
  assert.equal(image.depth, 8, `${label}: expected 8-bit PNG`);
  const hasAlpha = image.channels === 4 || image.channels === 2;
  let transparentPixels = 0;
  let visiblePixels = 0;
  for (let i = 0; i < image.data.length; i += image.channels) {
    const alpha = hasAlpha ? image.data[i + image.channels - 1] : 255;
    if (alpha < 255) transparentPixels++;
    if (alpha > 0) visiblePixels++;
  }
  assert.ok(visiblePixels > 0, `${label}: image is empty`);
  if (transparent) assert.ok(hasAlpha && transparentPixels > 0, `${label}: requires transparency`);
  else assert.equal(transparentPixels, 0, `${label}: must be fully opaque`);
  console.log(`${label}: ${image.width}×${image.height}, ${transparent ? 'transparent' : 'opaque'} — OK`);
}
assert.match(config.android.package, /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/);
assert.equal(config.android.package, config.ios.bundleIdentifier, 'App identifiers should match');
assert.ok(Number.isInteger(config.android.versionCode) && config.android.versionCode > 0);
console.log(`Release identity: ${config.name} ${config.version} (${config.android.package}) — OK`);
