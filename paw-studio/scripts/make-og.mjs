#!/usr/bin/env node
/**
 * Собирает превью для соцсетей (public/og.jpg, 1200×630) из фирменных
 * токенов: фон страницы, знак лапы, дисплейная гарнитура. Запускать после
 * изменения названия или подписи в шапке сайта.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, '../public');
const fontPath = path.join(
  root,
  '../node_modules/@fontsource-variable/literata/files/literata-cyrillic-opsz-normal.woff2',
);

await mkdir(outDir, { recursive: true });

// Шрифт встраиваем в SVG: у rsvg внутри sharp нет доступа к системным гарнитурам.
let fontFace = '';
try {
  const font = await readFile(fontPath);
  fontFace = `@font-face{font-family:'Literata';src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');}`;
} catch {
  console.warn('Шрифт не найден, используется системная засечная гарнитура.');
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <style>
    ${fontFace}
    .title { font-family: 'Literata', Georgia, serif; font-size: 74px; fill: #111111; letter-spacing: -1.5px; }
    .sub { font-family: 'Literata', Georgia, serif; font-size: 30px; fill: #666666; }
    .brand { font-family: 'Literata', Georgia, serif; font-size: 30px; fill: #49583A; letter-spacing: 0.5px; }
  </style>
  <rect width="1200" height="630" fill="#F7F7F5"/>
  <rect x="0" y="0" width="1200" height="8" fill="#49583A"/>
  <g transform="translate(88,86) scale(0.62)" fill="#49583A">
    <ellipse cx="15.5" cy="26" rx="6.4" ry="7.6" transform="rotate(-18 15.5 26)"/>
    <ellipse cx="32" cy="20.5" rx="6.6" ry="7.8"/>
    <ellipse cx="48.5" cy="26" rx="6.4" ry="7.6" transform="rotate(18 48.5 26)"/>
    <path d="M32 32.5c7.8 0 14.6 5.4 14.6 12.2 0 4.6-3.5 7.3-7.6 7.3-2.7 0-4.9-1.1-7-1.1s-4.3 1.1-7 1.1c-4.1 0-7.6-2.7-7.6-7.3 0-6.8 6.8-12.2 14.6-12.2z"/>
  </g>
  <text class="brand" x="140" y="128">Paw Studio</text>
  <text class="title" x="88" y="330">Груминг со спокойным</text>
  <text class="title" x="88" y="418">характером</text>
  <text class="sub" x="88" y="500">Салон для собак и кошек на Патриарших</text>
  <text class="sub" x="88" y="546">Москва, Малая Бронная, 24 · +7 (495) 120-45-67</text>
</svg>`;

const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer();
await writeFile(path.join(outDir, 'og.jpg'), buffer);
console.log(`public/og.jpg готов (${(buffer.length / 1024).toFixed(0)} КБ)`);
