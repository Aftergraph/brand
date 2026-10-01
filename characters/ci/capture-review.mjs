#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {launchBrowser, repoRoot} from './lib.mjs';

const reviewFile = path.join(repoRoot, 'characters/review/index.html');
const outDir = path.join(repoRoot, 'characters/generated/qa');
const filenames = {dark: 'review-dark.png', light: 'review-light.png'};
fs.mkdirSync(outDir, {recursive: true});

const browser = await launchBrowser();
const page = await browser.newPage();
await page.setViewport({width: 1600, height: 1000, deviceScaleFactor: 1});
await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
await page.goto(pathToFileURL(reviewFile).href, {waitUntil: 'load'});

async function capture(theme) {
  await page.select('#theme', theme);
  await page.evaluate(async () => {
    const visible = [...document.images].filter((img) => !img.closest('[hidden]'));
    await Promise.all(visible.map((img) => img.decode?.().catch(() => {}) || Promise.resolve()));
  });
  const target = path.join(outDir, filenames[theme]);
  await page.screenshot({path: target, fullPage: true});
  return target;
}
const outputs = [];
try {
  for (const theme of ['dark', 'light']) outputs.push(await capture(theme));
} finally {
  await browser.close();
}

for (const output of outputs) console.log(path.relative(repoRoot, output));
