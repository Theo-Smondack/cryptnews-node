import { Browser, Page } from 'puppeteer-core';
import { PuppeteerBrowser } from '../../lib/classes';

export const timeout = 60000;

describe('Puppeteer Test', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await PuppeteerBrowser.getInstance();
    page = await browser.newPage();
  }, timeout);


  it('should return Page title', async () => {
    return page.goto('https://example.com').then(async () => {
      const title = await page.title();
      expect(title).toBe('Example Domain');
    });
  }, timeout);
});
