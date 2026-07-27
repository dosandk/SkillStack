import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

import { APP_URL } from './constants';

export async function launchBrowser(): Promise<Browser> {
  // NOTE: headed by default for local development (`test:e2e`); CI sets
  // E2E_HEADLESS=true (`test:e2e:ci`) since there is no display.
  const isHeadless = process.env.E2E_HEADLESS === 'true';

  return puppeteer.launch({
    headless: isHeadless,
    slowMo: isHeadless ? undefined : 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

export async function openApp(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  await page.goto(APP_URL, { waitUntil: 'networkidle0' });

  return page;
}
