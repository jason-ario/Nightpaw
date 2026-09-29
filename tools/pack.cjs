// Packs Nightpaw for upload to Vibe-Games:
//   release/nightpaw-<version>.zip   the game package (upload it in Publish, or as an update)
//   release/store/                   cover, header, banner and screenshots for the store page
// Usage: node tools/pack.cjs            (builds dist/ first)
//        node tools/pack.cjs --no-build (zips the existing dist/)
// No dependencies; needs Node 22+ (zlib.crc32).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const out = path.join(root, 'release');

if (!process.argv.includes('--no-build')) execSync('node tools/build.cjs', { cwd: root, stdio: 'inherit' });
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));

function walk(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walk(path.join(dir, e.name), rel) : [rel];
  }).sort();
}

function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, data] of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const comp = zlib.deflateRawSync(data, { level: 9 });
    const stored = comp.length >= data.length; // PNGs rarely shrink; store them as-is
    const body = stored ? data : comp;
    const crc = zlib.crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(stored ? 0 : 8, 8);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nameBuf.length, 26);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(stored ? 0 : 8, 10);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt32LE(offset, 42);
    locals.push(lh, nameBuf, body); centrals.push(ch, nameBuf);
    offset += 30 + nameBuf.length + body.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

fs.mkdirSync(out, { recursive: true });
const files = walk(dist).map((f) => [f, fs.readFileSync(path.join(dist, f))]);
const zipPath = path.join(out, `nightpaw-${manifest.version}.zip`);
fs.writeFileSync(zipPath, zip(files));
console.log(`${path.relative(root, zipPath)}  ${files.length} files, ${(fs.statSync(zipPath).size / 1048576).toFixed(1)} MB`);

// Store art made by tools/store/make-store-media.cjs (run it first if store-media/ is missing).
const media = path.join(root, 'store-media');
if (fs.existsSync(media)) {
  fs.mkdirSync(path.join(out, 'store'), { recursive: true });
  const names = { 'cover.png': 'cover.png', 'header.png': 'header.png', 'hero.png': 'banner.png' };
  for (const f of fs.readdirSync(media)) {
    const target = names[f] ?? (/^shot\d\.png$/.test(f) ? f : null);
    if (target) fs.copyFileSync(path.join(media, f), path.join(out, 'store', target));
  }
  console.log('release/store/  cover, header, banner and screenshots');
} else {
  console.log('(no store-media/ yet: run node tools/store/make-store-media.cjs --shots <url> for store art)');
}
