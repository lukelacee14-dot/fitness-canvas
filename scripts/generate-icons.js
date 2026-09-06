// One-off build-time script (run manually with `node scripts/generate-icons.js`)
// that generates placeholder PWA icon PNGs with zero dependencies, using only
// Node's built-in zlib for DEFLATE compression. Produces a simple geometric
// mark (a white cross on the app's accent color) at the sizes the manifest
// and apple-touch-icon need. Re-run and commit the output whenever the
// placeholder mark needs to change; a real designed icon replaces this later
// (see IDEAS.md).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ACCENT = [0x2f, 0x6f, 0xed]; // #2f6fed, matches css/canvas.css --accent
const WHITE = [0xff, 0xff, 0xff];
const OUT_DIR = path.join(__dirname, '..', 'icons');

let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdr = pngChunk('IHDR', ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 }));
  const iend = pngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function insideRoundedSquare(x, y, size, r) {
  if (r <= 0) return true;
  const inCornerZoneX = x < r || x > size - r;
  const inCornerZoneY = y < r || y > size - r;
  if (!inCornerZoneX || !inCornerZoneY) return true;
  const cx = x < r ? r : size - r;
  const cy = y < r ? r : size - r;
  const dx = x - cx, dy = y - cy;
  return (dx * dx + dy * dy) <= r * r;
}

function insidePlus(x, y, size, halfArm, halfThick) {
  const cx = size / 2, cy = size / 2;
  const dx = x - cx, dy = y - cy;
  const inVerticalBar = Math.abs(dx) <= halfThick && Math.abs(dy) <= halfArm;
  const inHorizontalBar = Math.abs(dy) <= halfThick && Math.abs(dx) <= halfArm;
  return inVerticalBar || inHorizontalBar;
}

function generateIcon(size, options) {
  const cornerRadius = options.cornerRadius || 0;
  const halfArm = size * options.armRatio;
  const halfThick = size * options.thickRatio;

  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const bgVisible = insideRoundedSquare(x + 0.5, y + 0.5, size, cornerRadius);
      const mark = insidePlus(x + 0.5, y + 0.5, size, halfArm, halfThick);
      let color, alpha;
      if (mark && bgVisible) {
        color = WHITE;
        alpha = 255;
      } else if (bgVisible) {
        color = ACCENT;
        alpha = 255;
      } else {
        color = ACCENT;
        alpha = 0; // transparent outside the rounded-corner mask
      }
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = alpha;
    }
  }
  return encodePNG(size, size, rgba);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const icon192 = generateIcon(192, { cornerRadius: 192 * 0.22, armRatio: 0.32, thickRatio: 0.11 });
fs.writeFileSync(path.join(OUT_DIR, 'icon-192.png'), icon192);

const icon512 = generateIcon(512, { cornerRadius: 512 * 0.22, armRatio: 0.32, thickRatio: 0.11 });
fs.writeFileSync(path.join(OUT_DIR, 'icon-512.png'), icon512);

// Maskable: full-bleed background (no rounding — the OS applies its own mask
// shape) with the mark scaled down to stay inside the ~80%-diameter safe zone.
const iconMaskable512 = generateIcon(512, { cornerRadius: 0, armRatio: 0.22, thickRatio: 0.075 });
fs.writeFileSync(path.join(OUT_DIR, 'icon-maskable-512.png'), iconMaskable512);

console.log('Generated icons/icon-192.png, icons/icon-512.png, icons/icon-maskable-512.png');
