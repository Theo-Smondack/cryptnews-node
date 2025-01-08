import { Page } from 'puppeteer-core';
import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';

export class JournalDuCoin implements INewsExtractionStrategy {
    async extractArticleUrls(page: Page): Promise<string[]> {
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h3.title'))
                .slice(0, 4)
                .map((h3) => {
                    const anchor = h3.querySelector('a')!;
                    return anchor.href;
                });
        });
    }

    async extractArticleContent(page: Page): Promise<string[]> {
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('div.content > p')).map(
                (element) => element.textContent!,
            );
        });
    }
}
