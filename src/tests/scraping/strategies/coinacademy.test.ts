import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';
import { Browser, Page } from 'puppeteer-core';
import { PuppeteerBrowser } from '../../../lib/classes';
import { CoinAcademy } from '../../../lib/classes/news-strategies';
import { scrapeUrls } from '../../../config/puppeteer';
import { timeout } from '../puppeteer.test';

describe('Coin academy scraping strategy Test', () => {
  let extractionStrategy : INewsExtractionStrategy;
  let browser : Browser;
  const url = scrapeUrls[0];
  let page : Page;

  beforeAll(async () => {
    extractionStrategy = new CoinAcademy();
    browser = await PuppeteerBrowser.getInstance();
  }, timeout);

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(url);
  }, timeout)

  it('should return the article urls', async () => {
    const urls = await extractionStrategy.extractArticleUrls(page);
    expect(urls).toHaveLength(4);
  }, timeout);

  it('should return the article content', async () => {
    const urls = await extractionStrategy.extractArticleUrls(page);
    await page.goto(urls[0]);
    const content = await extractionStrategy.extractArticleContent(page);
    expect(content).not.toHaveLength(0);
  }, timeout);

  afterAll(async () => {
    await browser.close();
  },timeout);
});
