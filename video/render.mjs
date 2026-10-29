import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const FILM_DURATION_MS = 40000;
const FILM_WIDTH = 1920;
const FILM_HEIGHT = 1080;
const FILM_SCENES = [
  { id: 'hook', startMs: 0 },
  { id: 'reveal', startMs: 3000 },
  { id: 'detect', startMs: 8000 },
  { id: 'scan', startMs: 11000 },
  { id: 'verify', startMs: 14000 },
  { id: 'decide', startMs: 20000 },
  { id: 'badge', startMs: 26000 },
  { id: 'montage', startMs: 32000 },
  { id: 'payoff', startMs: 37000 },
];

const OUTPUT_DIR = new URL('../outputs/', import.meta.url);
const PREVIEW_URL = process.env.VIDEO_URL || 'http://127.0.0.1:5174/';

async function waitForHttp(url) {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // still booting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Video preview did not start: ${url}`);
}

async function ensureServer() {
  if (process.env.VIDEO_URL) return null;
  const child = spawn('npx', ['vite', '--config', 'video/vite.config.ts', '--host', '127.0.0.1', '--port', '5174'], {
    stdio: 'inherit',
    cwd: new URL('..', import.meta.url),
  });
  await waitForHttp(PREVIEW_URL);
  return child;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const server = await ensureServer();
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: FILM_WIDTH, height: FILM_HEIGHT },
    recordVideo: {
      dir: OUTPUT_DIR.pathname,
      size: { width: FILM_WIDTH, height: FILM_HEIGHT },
    },
  });
  const page = await context.newPage();
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="launch-film"]');

  const frames = {};
  for (const scene of FILM_SCENES) {
    await page.waitForFunction((start) => {
      const node = document.querySelector('[data-testid="launch-film"]');
      return Number(node?.getAttribute('data-time') || 0) >= start + 400;
    }, scene.startMs, { timeout: FILM_DURATION_MS + 4000 });
    const path = new URL(`./frame-${scene.id}.png`, OUTPUT_DIR).pathname;
    await page.screenshot({ path });
    frames[scene.id] = path;
  }

  await page.waitForFunction((end) => {
    const node = document.querySelector('[data-testid="launch-film"]');
    return Number(node?.getAttribute('data-time') || 0) >= end;
  }, FILM_DURATION_MS - 50, { timeout: FILM_DURATION_MS + 4000 });
  await page.screenshot({ path: new URL('./frame-payoff-final.png', OUTPUT_DIR).pathname });

  const video = page.video();
  await context.close();
  await browser.close();
  if (video) {
    const raw = await video.path();
    await copyFile(raw, new URL('./gold-detector-launch.webm', OUTPUT_DIR).pathname);
  }
  await writeFile(new URL('./launch-manifest.json', OUTPUT_DIR), `${JSON.stringify({
    durationMs: FILM_DURATION_MS,
    width: FILM_WIDTH,
    height: FILM_HEIGHT,
    captions: 'video/captions/launch.ru.vtt',
    frames,
  }, null, 2)}\n`);
  if (server) server.kill();
  console.log('Rendered launch film to outputs/gold-detector-launch.webm');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
