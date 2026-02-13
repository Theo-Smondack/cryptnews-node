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

    it('should return the article urls', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);

        expect(urls).toHaveLength(4);
        expect(urls.every((u) => /^https:\/\/www\.cointribune\.com\/.+/.test(u))).toBe(true);
    }, timeout);

    it('should return valid cointribune article links', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);

        expect(urls.length).toBeGreaterThan(0);
        expect(urls.every((u) => u.includes('cointribune.com') && !/\/actu\/?$/.test(u))).toBe(true);
    }, timeout);

    it('should return the article content', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);
        expect(urls.length).toBeGreaterThan(0);

        await page.goto(urls[0], { waitUntil: 'networkidle2' });
        const content = await extractionStrategy.extractArticleContent(page);

        expect(content).not.toHaveLength(0);
        expect(content.length).toBeGreaterThan(2);
    }, timeout);

    it('should return content without CTA/promotional text', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);
        expect(urls.length).toBeGreaterThan(0);

        await page.goto(urls[0], { waitUntil: 'networkidle2' });
        const content = await extractionStrategy.extractArticleContent(page);

        const joinedContent = content.join(' ').toLowerCase();
        expect(joinedContent).not.toContain('inscrivez-vous');
        expect(joinedContent).not.toContain("ceci n'est pas un conseil");
        expect(joinedContent).not.toContain('résumer cet article');
    }, timeout);

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    }, timeout);
});
