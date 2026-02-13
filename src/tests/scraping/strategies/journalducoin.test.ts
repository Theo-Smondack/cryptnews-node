import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';
import { Browser, Page } from 'puppeteer-core';
import { PuppeteerBrowser } from '../../../lib/classes';
import { JournalDuCoin } from '../../../lib/classes/news-strategies';
import { scrapeUrls } from '../../../config/puppeteer';
import { timeout } from '../puppeteer.test';

describe('Journal du coin scraping strategy Test', () => {
  let extractionStrategy: INewsExtractionStrategy;
  let browser: Browser;
  const url = scrapeUrls[1]; // https://journalducoin.com/news/
  let page: Page;

  beforeAll(async () => {
    extractionStrategy = new JournalDuCoin();
    browser = await PuppeteerBrowser.getInstance();
  }, timeout);

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
  }, timeout);

  afterEach(async () => {
    if (page && !page.isClosed()) {
      await page.close();
    }
  });

  it('should return the article urls', async () => {
    const urls = await extractionStrategy.extractArticleUrls(page);
    
    expect(urls).toHaveLength(4);
    urls.forEach((url) => {
      expect(url).toMatch(/^https:\/\/journalducoin\.com\/.+/);
    });
  }, timeout);

  it('should return article urls that are valid journalducoin links', async () => {
    const urls = await extractionStrategy.extractArticleUrls(page);
    
    expect(urls.length).toBeGreaterThan(0);
    urls.forEach((url) => {
      expect(url).toContain('journalducoin.com');
      expect(url).not.toContain('/news/'); // Should be individual article, not the news listing
    });
  }, timeout);

  it('should return the article content', async () => {
    const urls = await extractionStrategy.extractArticleUrls(page);
    expect(urls.length).toBeGreaterThan(0);
    
    await page.goto(urls[0], { waitUntil: 'networkidle2' });
    const content = await extractionStrategy.extractArticleContent(page);
    
    expect(content).not.toHaveLength(0);
    expect(content.length).toBeGreaterThan(2); // Should have multiple paragraphs
  }, timeout);

  it('should return content without CTA/promotional text', async () => {
    const urls = await extractionStrategy.extractArticleUrls(page);
    expect(urls.length).toBeGreaterThan(0);
    
    await page.goto(urls[0], { waitUntil: 'networkidle2' });
    const content = await extractionStrategy.extractArticleContent(page);
    
    content.forEach((paragraph) => {
      // Should not contain typical CTA phrases
      expect(paragraph.toLowerCase()).not.toContain('inscrivez-vous');
      expect(paragraph.toLowerCase()).not.toContain('ceci n\'est pas un conseil');
    });
  }, timeout);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  }, timeout);
});
