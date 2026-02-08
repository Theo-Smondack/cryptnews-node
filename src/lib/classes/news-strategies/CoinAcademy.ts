import { Page } from 'puppeteer-core';
import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';

export class CoinAcademy implements INewsExtractionStrategy {
    async extractArticleUrls(page: Page): Promise<string[]> {
        // Wait for article titles to load
        await page.waitForSelector('h3.cs-entry__title a', { timeout: 10000 });

        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h3.cs-entry__title a'))
                .slice(0, 4)
                .map((anchor) => (anchor as HTMLAnchorElement).href)
                .filter((href) => href && href.startsWith('https://coinacademy.fr/'));
        });
    }

    async extractArticleContent(page: Page): Promise<string[]> {
        // Wait for article content to load
        await page.waitForSelector('div.entry-content', { timeout: 10000 });

        return await page.evaluate(() => {
            const contentDiv = document.querySelector('div.entry-content');
            if (!contentDiv) return [];

            return Array.from(contentDiv.querySelectorAll('p, h2, h3'))
                .filter((el) => {
                    const text = el.textContent?.trim() || '';
                    // Filter out empty or very short paragraphs
                    if (text.length < 10) return false;
                    // Filter out common CTA/promo patterns
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes('inscrivez-vous')) return false;
                    if (lowerText.includes('rejoignez-nous')) return false;
                    if (lowerText.includes('ceci n\'est pas un conseil')) return false;
                    return true;
                })
                .map((el) => el.textContent?.trim() || '')
                .filter((text) => text.length > 0);
        });
    }
}
