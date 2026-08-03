#!/usr/bin/env node
/**
 * Только для локальной визуальной проверки: кладёт в src/assets/photos
 * нейтральные заглушки нужных пропорций, чтобы оценить композицию секций
 * там, где нет доступа к стоковому CDN. Перед коммитом удаляются:
 *
 *   node scripts/qa-placeholders.mjs        # создать
 *   node scripts/qa-placeholders.mjs clean  # удалить
 */
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, '../src/assets/photos');

if (process.argv[2] === 'clean') {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  console.log('Заглушки удалены.');
  process.exit(0);
}

const slots = JSON.parse(await readFile(path.join(root, '../src/data/photos.slots.json'), 'utf8'));
await mkdir(outDir, { recursive: true });

const tones = [
  ['#cfd3c2', '#a8b096'],
  ['#e0d6c3', '#c3b294'],
  ['#c8ccc0', '#9aa793'],
  ['#ded3c6', '#b9a894'],
];

let index = 0;
for (const slot of Object.values(slots)) {
  const [from, to] = tones[index % tones.length];
  index += 1;
  const { width, height } = slot;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient></defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <circle cx="${width * 0.62}" cy="${height * 0.38}" r="${Math.min(width, height) * 0.22}" fill="#ffffff" opacity="0.14"/>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 70 }).toFile(path.join(outDir, `${slot.key}.jpg`));
}

console.log(`Создано заглушек: ${index}. Удалить: node scripts/qa-placeholders.mjs clean`);
