import { Page } from 'puppeteer-core';
import { INewsExtractionStrategy } from '../../../types/classes/NewsExtractionStrategy';

export class JournalDuCoin implements INewsExtractionStrategy {
    async extractArticleUrls(page: Page): Promise<string[]> {
        // Wait for the article list to load
        await page.waitForSelector('h3.title a', { timeout: 10000 });
        
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('h3.title a'))
                .slice(0, 4)
                .map((anchor) => (anchor as HTMLAnchorElement).href)
                .filter((href) => href && href.startsWith('https://journalducoin.com/'));
        });
    }

    async extractArticleContent(page: Page): Promise<string[]> {
        // Wait for article content to load
        await page.waitForSelector('div.content > p', { timeout: 10000 });
        
        return await page.evaluate(() => {
            // Get the first div.content which contains the main article
            const contentDiv = document.querySelector('div.content');
            if (!contentDiv) return [];
            
            // Get all paragraphs, excluding those inside CTAs or ads
            return Array.from(contentDiv.querySelectorAll(':scope > p, :scope > h2'))
                .filter((el) => {
                    // Exclude CTA containers
                    if (el.querySelector('.jdc-cta')) return false;
                    // Exclude empty paragraphs
                    const text = el.textContent?.trim() || '';
                    if (text.length < 10) return false;
                    return true;
                })
                .map((el) => el.textContent?.trim() || '')
                .filter((text) => text.length > 0);
        });
    }
}
