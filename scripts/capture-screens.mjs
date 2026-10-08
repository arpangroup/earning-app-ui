/**
 * Captures every screen of the app into docs/screens/*.jpg for the README.
 *
 *   npm run dev            # in one terminal
 *   npm run screenshots    # in another
 *
 * Uses a locally installed Chrome/Edge (override with CHROME_PATH).
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE = process.env.APP_URL || 'http://localhost:5180';
const OUT = path.resolve('docs/screens');
const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => fs.existsSync(p));
if (!executablePath) throw new Error('No Chrome/Edge found — set CHROME_PATH');

fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const shot = async (name) => {
  await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 80 });
  console.log('✓', name);
};
const go = async (route, wait = 900) => {
  await page.goto(BASE + route, { waitUntil: 'networkidle0' });
  await sleep(wait);
};
/** Click the first button/link whose text includes `text`. */
const click = (text) =>
  page.evaluate((t) => {
    const el = [...document.querySelectorAll('button, a')].find((b) => b.textContent.includes(t));
    if (!el) throw new Error(`No element with text "${t}"`);
    el.click();
  }, text);
const scrollScreen = (y) => page.evaluate((v) => document.querySelector('.screen').scrollTo(0, v), y);
/** Force the mock backend's next random outcome (e.g. a jackpot) for ~1.2s, covering its simulated latency. */
const rigRandom = (value) =>
  page.evaluate((v) => {
    const orig = Math.random;
    Math.random = () => v;
    setTimeout(() => (Math.random = orig), 1200);
  }, value);

const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && !m.text().includes('vibrate') && problems.push(`console: ${m.text()}`));

// --- Onboarding (start logged out)
await go('/login', 300);
await page.evaluate(() => localStorage.clear());
await go('/', 1300);
await shot('01-splash');
await go('/login');
await shot('02-login');
await page.type('.phone-field input', '9876543210');
await click('GET OTP');
await page.waitForSelector('.otp-box');
for (const d of '1234') await page.keyboard.type(d);
await sleep(300);
await shot('03-login-otp');
await click('VERIFY');
await page.waitForSelector('.home-header'); // session created + bootstrap loaded

// --- Home (session is persisted, so full page loads stay logged in)
await go('/home', 1200);
await shot('04-home');
await scrollScreen(560);
await sleep(500);
await shot('05-home-games');
await scrollScreen(1200);
await sleep(500);
await shot('06-home-tasks-winners');
await scrollScreen(0);
await click('Claim');
await sleep(1600);
await shot('07-daily-checkin-reward');

// --- Games
await go('/games');
await shot('08-games');

// --- Spin wheel
await go('/spin');
await shot('09-spin-wheel');
await rigRandom(0.985); // lands on JACKPOT
await click('SPIN FREE');
await sleep(2200);
await shot('10-spin-wheel-spinning');
await sleep(5000);
await shot('11-spin-wheel-jackpot');

// --- Lottery
await go('/lottery');
await shot('12-lottery-draws');
await click('My Tickets');
await sleep(500);
await shot('13-lottery-my-tickets');
await click('Results');
await sleep(500);
await shot('14-lottery-results');
await go('/lottery/mega-daily');
await click('Quick Pick');
await sleep(1400);
await shot('15-lottery-pick-numbers');
await click('BUY TICKET');
await sleep(900);
await shot('16-lottery-ticket-booked');
await click('Watch Live Draw');
await sleep(900);
await rigRandom(0.985); // full match for the demo draw
await click('START DRAW');
await sleep(5200);
await shot('17-lottery-live-draw');
await sleep(6500);
await shot('18-lottery-jackpot-win');

// --- Scratch card
await go('/scratch');
await shot('19-scratch-card');
await rigRandom(0.2); // winning card
await click('BUY CARD');
await sleep(800);
// scratch a few strokes for a realistic "in progress" shot
const box = await page.$eval('.scratch-canvas', (c) => {
  const r = c.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
for (const [fy, ty] of [[0.25, 0.45], [0.6, 0.4]]) {
  await page.mouse.move(box.x + 20, box.y + box.h * fy);
  await page.mouse.down();
  await page.mouse.move(box.x + box.w - 20, box.y + box.h * ty, { steps: 12 });
  await page.mouse.up();
}
await sleep(300);
await shot('20-scratch-in-progress');
await click('Reveal all');
await sleep(2200);
await shot('21-scratch-win');

// --- Slots
await go('/slots');
await shot('22-slots');
await click('SPIN');
await sleep(1000);
await shot('23-slots-spinning');

// --- Earn
await go('/earn');
await shot('24-earn-tasks');
await click('Watch');
await sleep(2300);
await shot('25-earn-watching-ad');

// --- Wallet & withdraw
await go('/wallet');
await shot('26-wallet');
await go('/withdraw');
await page.type('.input', 'aarav@upi');
await shot('27-withdraw');
await click('WITHDRAW');
await sleep(3300);
await shot('28-withdraw-success');

// --- Social / account
await go('/leaderboard');
await shot('29-leaderboard');
await go('/profile');
await shot('30-profile');
await go('/notifications');
await shot('31-notifications');
await go('/refer');
await shot('32-refer-and-earn');

await browser.close();
if (problems.length) {
  console.error(`${problems.length} page error(s):\n${problems.join('\n')}`);
  process.exitCode = 1;
}
console.log(`\nSaved to ${OUT}`);
