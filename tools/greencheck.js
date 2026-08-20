/*
 * Замер доли зелёного в первом экране — пункт чек-листа «зелёного меньше 5 %».
 * Считает пиксели по всему первому экрану и отдельно без шапки, потому что
 * зелёная полоса шапки — фиксированная величина, а всё остальное зависит
 * от вёрстки секций.
 *
 *   npm run build && npx http-server dist -p 8080 -s &
 *   node tools/greencheck.js
 *
 * Нужен playwright: npm i -D playwright
 */
const { chromium } = require('playwright');
const zlib = require('zlib');

function pngPixels(buf) {
  // минимальный распаковщик PNG (8-бит RGBA/RGB, без интерлейса)
  let pos = 8, w = 0, h = 0, bd = 0, ct = 0, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bd !== 8) throw new Error('bit depth ' + bd);
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : null;
  if (!ch) throw new Error('colour type ' + ct);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[rp++];
    const line = raw.subarray(rp, rp + stride); rp += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0, v = line[x];
      cur[x] = (f === 0 ? v : f === 1 ? v + a : f === 2 ? v + b : f === 3 ? v + ((a + b) >> 1) :
        v + (function (a, b, c) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; })(a, b, c)) & 255;
    }
  }
  return { w, h, ch, px: out };
}

function greenShare(png) {
  const { w, h, ch, px } = pngPixels(png);
  let green = 0;
  for (let i = 0; i < w * h; i++) {
    const r = px[i * ch], g = px[i * ch + 1], b = px[i * ch + 2];
    // «зелёный по бренду»: доминирует G, цвет насыщенный, не серый и не почти-белый
    if (g > 60 && g - r > 40 && g - b > 20 && !(r > 200 && g > 200 && b > 200)) green++;
  }
  return { pct: (green / (w * h)) * 100, w, h };
}

(async () => {
  const b = await chromium.launch();
  for (const [name, url, w, h] of [
    ['главная 1280×900', '/', 1280, 900],
    ['главная 390×844', '/', 390, 844],
    ['дизайн-система 1280×900', '/_styleguide/', 1280, 900],
  ]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto('http://127.0.0.1:8080' + url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const shot = await p.screenshot();           // только первый экран
    const r = greenShare(shot);
    const below = await p.screenshot({ clip: { x: 0, y: 96, width: w, height: h - 96 } });
    const rb = greenShare(below);
    console.log(name.padEnd(26), r.pct.toFixed(2) + '% всего   |', rb.pct.toFixed(2) + '% без шапки');
    await p.close();
  }
  await b.close();
})();
