import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve(process.cwd(), 'docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  // Helper to save screenshot
  const capture = async (name, waitMs = 1000) => {
    await new Promise((r) => setTimeout(r, waitMs));
    const outPath = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ Saved ${name}.png`);
  };

  try {
    // 1. Landing Page - Light
    console.log('Capturing Landing Page (Light)...');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('sn-theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await capture('01-landing-light');

    // 2. Landing Page - Dark
    console.log('Capturing Landing Page (Dark)...');
    await page.evaluate(() => {
      const toggle = document.querySelector('button[aria-label="Switch to dark theme"]');
      if (toggle) toggle.click();
      else {
        localStorage.setItem('sn-theme', 'dark');
        document.documentElement.classList.add('dark');
      }
    });
    await capture('02-landing-dark');

    // 3. Login Page - Light
    console.log('Capturing Login Page (Light)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await capture('03-login-light');

    // 4. Login Page - Dark
    console.log('Capturing Login Page (Dark)...');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await capture('04-login-dark');

    // 5. Register Page - Light
    console.log('Capturing Register Page (Light)...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await capture('05-register-light');

    // 6. Register Page - Dark
    console.log('Capturing Register Page (Dark)...');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await capture('06-register-dark');

    // 7. Login and capture Dashboard (Light & Dark)
    console.log('Logging in with demo credentials...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });

    // Click demo fill button or fill directly
    await page.type('input[type="email"]', 'demo@shortnotes.ai');
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for dashboard navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));

    console.log('Capturing Dashboard (Light)...');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await capture('07-dashboard-light', 1500);

    console.log('Capturing Dashboard (Dark)...');
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await capture('08-dashboard-dark', 1500);

    // 8. Study Mode
    console.log('Capturing Study Mode...');
    await page.goto(`${BASE_URL}/dashboard/study`, { waitUntil: 'networkidle2' });
    await capture('09-study-mode-dark', 1500);

    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await capture('10-study-mode-light', 1500);

    // 9. Knowledge Graph
    console.log('Capturing Knowledge Graph...');
    await page.goto(`${BASE_URL}/dashboard/graph`, { waitUntil: 'networkidle2' });
    await capture('11-knowledge-graph-light', 2000);

    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await capture('12-knowledge-graph-dark', 2000);

    // 10. AI Assistant
    console.log('Capturing AI Assistant...');
    await page.goto(`${BASE_URL}/dashboard/ai`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await capture('13-ai-assistant-light', 1500);

    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await capture('14-ai-assistant-dark', 1500);

    console.log('All screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});

