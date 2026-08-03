#!/usr/bin/env node
/**
 * Собирает сайт в один самодостаточный HTML-файл: CSS и JS встраиваются
 * в разметку, шрифты уже пришли как data: URI из vite.config.preview.ts.
 * Готовый файл не делает ни одного сетевого запроса, поэтому его можно
 * открыть локально или отдать в песочницу со строгой политикой безопасности.
 *
 *   node scripts/build-preview.mjs   → dist-preview/paw-studio-preview.html
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, '../dist-preview');
const assetsDir = path.join(outDir, 'assets');

const assets = await readdir(assetsDir);
const jsFile = assets.find((name) => name.endsWith('.js'));
const cssFile = assets.find((name) => name.endsWith('.css'));
if (!jsFile || !cssFile) throw new Error('Не найдены собранные JS/CSS. Сначала запустите сборку.');

const js = await readFile(path.join(assetsDir, jsFile), 'utf8');
const css = await readFile(path.join(assetsDir, cssFile), 'utf8');

const external = [...js.matchAll(/https?:\/\/[^"'`\s)]+/g)]
  .map((match) => match[0])
  .filter((url) => !url.startsWith('http://www.w3.org/'));
if (external.length > 0) {
  console.warn(`Внимание: в бандле остались внешние адреса (${external.length}):`);
  for (const url of [...new Set(external)].slice(0, 5)) console.warn('  ' + url);
}

// Разметка отдаётся без doctype/html/head/body: хостинг артефактов
// оборачивает содержимое в собственный каркас документа.
const html = `<title>Paw Studio — салон груминга для собак и кошек</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replace(/<\/script/gi, '<\\/script')}
</script>
`;

const target = path.join(outDir, 'paw-studio-preview.html');
await writeFile(target, html);

const kb = (value) => `${(value / 1024).toFixed(0)} КБ`;
console.log(`Готово: ${path.relative(path.join(root, '..'), target)}`);
console.log(`  CSS ${kb(css.length)} · JS ${kb(js.length)} · всего ${kb(html.length)}`);
console.log(`  внешних запросов: ${external.length}`);
