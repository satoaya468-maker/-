#!/usr/bin/env node
/**
 * Снимает секции сайта на мобильном и десктопном вьюпорте для визуальной
 * проверки вёрстки. Требует запущенный `npm run preview` на PORT.
 *
 *   node scripts/screenshots.mjs [--port 4173] [--out shots] [--only hero,ceny]
 */
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const PORT = argValue('--port', '4173');
const OUT = argValue('--out', 'shots');
const ONLY = argValue('--only', '');
const BASE = `http://127.0.0.1:${PORT}`;
const EXECUTABLE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const targets = [
  { name: 'hero', selector: 'section:has(h1)' },
  { name: 'salon', selector: '#salon' },
  { name: 'uslugi', selector: '#uslugi' },
  { name: 'principy', selector: '#principy' },
  { name: 'raboty', selector: '#raboty' },
  { name: 'komanda', selector: '#komanda' },
  { name: 'ceny', selector: '#ceny' },
  { name: 'zapis', selector: '#zapis' },
  { name: 'otzyvy', selector: '#otzyvy' },
  { name: 'voprosy', selector: '#voprosy' },
  { name: 'zhurnal', selector: '#zhurnal' },
  { name: 'kontakty', selector: '#kontakty' },
  { name: 'footer', selector: 'footer' },
];

const viewports = [
  { label: 'm', width: 390, height: 844, scale: 2 },
  { label: 'd', width: 1440, height: 900, scale: 1 },
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const selected = ONLY ? ONLY.split(',') : null;
const problems = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.scale,
    locale: 'ru-RU',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`[console ${viewport.label}] ${msg.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`[pageerror ${viewport.label}] ${error.message}`));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  // Прокручиваем всю страницу, чтобы отработали whileInView-появления.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 250));
  });

  // Горизонтальное переполнение — самый частый дефект адаптива.
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    if (doc.scrollWidth <= doc.clientWidth + 1) return null;
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 60)}`);
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, wide };
  });
  if (overflow) problems.push(`[overflow ${viewport.label}] ${JSON.stringify(overflow)}`);

  for (const target of targets) {
    if (selected && !selected.includes(target.name)) continue;
    const element = page.locator(target.selector).first();
    if ((await element.count()) === 0) {
      problems.push(`[missing ${viewport.label}] ${target.selector}`);
      continue;
    }
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
    await element.screenshot({
      path: path.join(OUT, `${viewport.label}-${target.name}.png`),
    });
  }

  await context.close();
}

await browser.close();

if (problems.length) {
  console.log('Замечания:');
  for (const problem of problems) console.log(' ·', problem);
} else {
  console.log('Ошибок консоли и переполнений не найдено.');
}
console.log(`Скриншоты: ${OUT}/`);
