import { Page } from 'puppeteer-core';

export interface INewsExtractionStrategy {
    extractArticleUrls(page: Page): Promise<string[]>;
    extractArticleContent(page: Page): Promise<string[]>;
}
