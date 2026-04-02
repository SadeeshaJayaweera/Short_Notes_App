const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Add a slight delay to ensure Next.js is fully running
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Capturing Landing Page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'public/screenshots/landing_page_actual.png' });

  console.log('Capturing Login Page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'public/screenshots/login_page_actual.png' });

  console.log('Capturing Register Page...');
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'public/screenshots/register_page_actual.png' });

  await browser.close();
  console.log('Screenshots captured successfully!');
})();
