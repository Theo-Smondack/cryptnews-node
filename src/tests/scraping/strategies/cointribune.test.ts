import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';
import { Browser, Page } from 'puppeteer-core';
import { PuppeteerBrowser } from '../../../lib/classes';
import { CoinTribune } from '../../../lib/classes/news-strategies';
import { scrapeUrls } from '../../../config/puppeteer';
import { timeout } from '../puppeteer.test';

describe('CoinTribune scraping strategy Test', () => {
    let extractionStrategy: INewsExtractionStrategy;
    let browser: Browser;
    const url = scrapeUrls[2]; // https://www.cointribune.com/actu/
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
        urls.forEach((url) => {
            expect(url).toMatch(/^https:\/\/www\.cointribune\.com\/.+/);
        });
    }, timeout);

    it('should return valid cointribune article links', async () => {
        const urls = await extractionStrategy.extractArticleUrls(page);

        expect(urls.length).toBeGreaterThan(0);
        urls.forEach((url) => {
            expect(url).toContain('cointribune.com');
            expect(url).not.toMatch(/\/actu\/?$/); // Should be individual article, not the listing
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
            expect(paragraph.toLowerCase()).not.toContain('inscrivez-vous');
            expect(paragraph.toLowerCase()).not.toContain("ceci n'est pas un conseil");
            expect(paragraph.toLowerCase()).not.toContain('résumer cet article');
        });
    }, timeout);

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    }, timeout);
});
