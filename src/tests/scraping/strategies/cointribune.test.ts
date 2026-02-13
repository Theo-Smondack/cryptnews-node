import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';
import { Browser, Page } from 'puppeteer-core';
import { PuppeteerBrowser } from '../../../lib/classes';
import { CoinTribune } from '../../../lib/classes/news-strategies';
import { scrapeUrls } from '../../../config/puppeteer';
import { timeout } from '../puppeteer.test';

describe('CoinTribune scraping strategy Test', () => {
    let extractionStrategy: INewsExtractionStrategy;
    let browser: Browser;
    const url = scrapeUrls[2];
    let page: Page;

    beforeAll(async () => {
        extractionStrategy = new CoinTribune();
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

    it('should return 4 article urls', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);
        expect(urls).toHaveLength(4);
    }, timeout);

    it('should return urls matching cointribune domain pattern', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);
        expect(urls.every((u) => /^https:\/\/www\.cointribune\.com\/.+/.test(u))).toBe(true);
    }, timeout);

    it('should return urls that are not the listing page', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);
        expect(urls.every((u) => !/\/actu\/?$/.test(u))).toBe(true);
    }, timeout);

    it('should return non-empty article content', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);
        await page.goto(urls[0], { waitUntil: 'networkidle2' });
        const content = await extractionStrategy.extractArticleContent(page);
        expect(content.length).toBeGreaterThan(2);
    }, timeout);

    it('should return content without promotional text', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);
        await page.goto(urls[0], { waitUntil: 'networkidle2' });
        const content = await extractionStrategy.extractArticleContent(page);
        const joinedContent = content.join(' ').toLowerCase();
        expect(joinedContent.includes('inscrivez-vous') || joinedContent.includes("ceci n'est pas un conseil") || joinedContent.includes('résumer cet article')).toBe(false);
    }, timeout);

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    }, timeout);
});
