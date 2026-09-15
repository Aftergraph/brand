import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import YAML from 'yaml';

export const repoRoot=path.resolve(import.meta.dirname,'../..');

export function loadConfig(configArg='characters/ci/ci-checks.yml'){
  const abs=path.resolve(repoRoot,configArg);
  return YAML.parse(fs.readFileSync(abs,'utf8'));
}

export function findChrome(){
  const candidates=[
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/local/bin/chromium',
  ].filter(Boolean);
  const found=candidates.find((p)=>fs.existsSync(p));
  if(!found) throw new Error(`Chromium/Chrome not found. Checked: ${candidates.join(', ')}`);
  return found;
}

export async function launchBrowser(){
  return puppeteer.launch({
    executablePath:findChrome(),
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  });
}

export function renderCasePath(renderCase){
  if(renderCase.source) return path.resolve(repoRoot,renderCase.source);
  if(renderCase.compose){
    const {role,state}=renderCase.compose;
    return path.resolve(repoRoot,'characters/generated/compositions',`${role}--${state}.svg`);
  }
  throw new Error(`Render case ${renderCase.id} has neither source nor compose`);
}

export function htmlForSvg(svg,background){
  const data=Buffer.from(svg).toString('base64');
  return `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${background}}img{display:block;width:100%;height:100%;object-fit:contain;animation:none!important;transition:none!important}</style></head><body><img id="asset" alt="" src="data:image/svg+xml;base64,${data}"></body></html>`;
}

export async function preparePage(page,{width,height,deviceScaleFactor,background}){
  await page.setViewport({width,height,deviceScaleFactor});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.evaluateOnNewDocument(()=>{
    Date.now=()=>0;
    performance.now=()=>0;
  });
  return background;
}

export async function loadSvgIntoPage(page,svg,background){
  await page.setContent(htmlForSvg(svg,background),{waitUntil:'load'});
  await page.evaluate(async()=>{
    if(document.fonts) await document.fonts.ready;
    const img=document.getElementById('asset');
    if(img?.decode) await img.decode();
    document.documentElement.dataset.renderReady='true';
  });
  await page.waitForSelector('html[data-render-ready="true"]');
}
