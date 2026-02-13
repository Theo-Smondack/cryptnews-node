import { Page } from 'puppeteer-core';
import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';

export class CoinTribune implements INewsExtractionStrategy {
    async extractArticleUrls(page: Page): Promise<string[]> {
        await page.waitForSelector('a.cointribune--a-la-une--item--post', { timeout: 10000 });

        return await page.evaluate(() => {
            return Array.from(
                document.querySelectorAll('a.cointribune--a-la-une--item--post') as NodeListOf<HTMLAnchorElement>,
            )
                .slice(0, 4)
                .map((anchor) => anchor.href)
                .filter((href) => href && href.startsWith('https://www.cointribune.com/'));
        });
    }

    async extractArticleContent(page: Page): Promise<string[]> {
        await page.waitForSelector('.wp-content', { timeout: 10000 });

        return await page.evaluate(() => {
            const contentDiv = document.querySelector('.wp-content');
            if (!contentDiv) return [];

            return Array.from(contentDiv.querySelectorAll('p, h2, h3'))
                .filter((el) => {
                    const text = el.textContent?.trim() || '';
                    if (text.length < 10) return false;
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes('inscrivez-vous')) return false;
                    if (lowerText.includes('rejoignez-nous')) return false;
                    if (lowerText.includes('ceci n\'est pas un conseil')) return false;
                    if (lowerText.includes('résumer cet article')) return false;
                    return true;
                })
                .map((el) => el.textContent?.trim() || '')
                .filter((text) => text.length > 0);
        });
    }
}
