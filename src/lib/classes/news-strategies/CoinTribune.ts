import { Page } from 'puppeteer-core';
import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';


export class CoinTribune implements INewsExtractionStrategy {
    async extractArticleUrls(page: Page): Promise<string[]> {
        return await page.evaluate(() => {
            return Array.from(
                document.querySelectorAll(
                    'a.cointribune--a-la-une--item--post',
                ) as NodeListOf<HTMLAnchorElement>,
            )
                .slice(0, 4)
                .map((anchor) => anchor.href);
        });
    }

    async extractArticleContent(page: Page): Promise<string[]> {
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('div.wp-content > p')).map(
                (element) => element.textContent!,
            );
        });
    }
}
