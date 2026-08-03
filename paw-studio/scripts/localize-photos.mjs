#!/usr/bin/env node
/**
 * Скачивает все фотослоты из `src/data/photos.slots.json`, пережимает их
 * через sharp (2x от целевой ширины, JPEG q82, прогрессивный) и складывает
 * в `src/assets/photos/<key>.jpg`. После этого сборка автоматически
 * предпочитает локальные файлы удалённым URL (см. src/data/photos.ts).
 *
 * Запускать в окружении с доступом к images.unsplash.com:
 *   npm run photos
 *
 * Финальный шаг перед продакшеном — заменить стоковые кадры на съёмку
 * клиента, положив файлы с теми же именами в src/assets/photos/.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const slotsPath = path.join(root, '../src/data/photos.slots.json');
const outDir = path.join(root, '../src/assets/photos');

const slots = JSON.parse(await readFile(slotsPath, 'utf8'));
await mkdir(outDir, { recursive: true });

let ok = 0;
let failed = 0;

for (const slot of Object.values(slots)) {
  const width = Math.min(slot.width * 2, 2400);
  const height = Math.round((slot.height / slot.width) * width);
  const url = `https://images.unsplash.com/photo-${slot.unsplashId}?auto=format&fit=crop&q=85&w=${width}&h=${height}&fm=jpg`;
  const target = path.join(outDir, `${slot.key}.jpg`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const optimized = await sharp(buffer)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer();
    await writeFile(target, optimized);
    ok += 1;
    console.log(`✓ ${slot.key} (${(optimized.length / 1024).toFixed(0)} КБ)`);
  } catch (error) {
    failed += 1;
    console.warn(`✗ ${slot.key}: ${error.message}`);
  }
}

console.log(`\nГотово: ${ok} сохранено, ${failed} с ошибками.`);
if (failed > 0) {
  console.log('Ошибки не критичны: для недостающих слотов сайт использует удалённые URL и фолбэки.');
}
