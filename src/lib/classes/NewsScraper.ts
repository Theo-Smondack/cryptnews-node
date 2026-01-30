import { Page } from 'puppeteer-core';
import { NewsExtractionStrategyFactory } from './NewsExtractionStrategyFactory';
import { NewsArticle, ScraperOptions, ScrapingRsp } from '../../types/classes/NewsScraper';
import { scrapeUrls } from '../../config/puppeteer';
import { PuppeteerBrowser } from './PuppeteerBrowser';
import { updateExistingArticlesByProvider } from '../../services/article';
import { isTestEnv } from '../utils';

export class NewsScraper {
    private strategyFactory: NewsExtractionStrategyFactory = new NewsExtractionStrategyFactory();
    private urls: string[] = [];

    constructor(urls?: string[]) {
        this.urls = urls || scrapeUrls;
    }

    async scrape(): Promise<ScrapingRsp> {
        // Process URLs sequentially to avoid overwhelming the browser
        for (const url of this.urls) {
            try {
                await this.extractArticles({ url });
            } catch (error) {
                console.error(`Failed to scrape ${url}:`, error);
                // Continue with next URL instead of failing everything
            }
        }
        return { success: true };
    }

    private async extractArticles(options: ScraperOptions): Promise<ScrapingRsp> {
        const strategyKey = this.extractStrategyKey(options.url);
        const extractionStrategy = this.strategyFactory.getStrategy(strategyKey);

        const browser = await PuppeteerBrowser.getInstance();

        const page = await browser.newPage();

        try {
            await page.goto(options.url, {
                waitUntil: 'networkidle0',
                timeout: options.timeout ?? 30000,
            });

            const articleUrls = await extractionStrategy.extractArticleUrls(page);
            const articles: (NewsArticle | null)[] = [];

            // Process articles sequentially to avoid browser overload
            for (const articleUrl of articleUrls.slice(0, options.maxArticles ?? 4)) {
                const articlePage = await browser.newPage();
                try {
                    await articlePage.goto(articleUrl, {
                        waitUntil: 'networkidle0',
                        timeout: options.timeout ?? 30000,
                    });

                    const content = await extractionStrategy.extractArticleContent(articlePage);
                    articles.push({ url: articleUrl, content, provider: strategyKey });
                } catch (error) {
                    console.error(`Failed to scrape ${articleUrl}:`, error);
                    articles.push(null);
                } finally {
                    await this.safeClosePage(articlePage);
                }
            }

            const filteredArticles = articles.filter((article): article is NewsArticle => article !== null);
            if (!isTestEnv()) {
                await updateExistingArticlesByProvider(filteredArticles);
            }
            return { success: true };
        } catch (error) {
            console.error('Failed to scrape data:', error);
            throw error;
        } finally {
            await this.safeClosePage(page);
        }
    }

    private async safeClosePage(page: Page): Promise<void> {
        try {
            if (!page.isClosed()) {
                await page.close();
            }
        } catch {
            // Page already closed or browser disconnected - ignore
        }
    }

    private extractStrategyKey(url: string): string {
        const hostname = new URL(url).hostname;
        if (hostname.includes('coinacademy')) return 'coinacademy';
        if (hostname.includes('journalducoin')) return 'journalducoin';
        if (hostname.includes('cointribune')) return 'cointribune';
        throw new Error(`No strategy found for URL: ${url}`);
    }
}
