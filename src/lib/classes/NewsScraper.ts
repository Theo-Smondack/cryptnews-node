import { Browser, Page } from 'puppeteer-core';
import { NewsExtractionStrategyFactory } from './NewsExtractionStrategyFactory';
import { NewsArticle, ScraperOptions, ScrapingRsp } from '../../types/classes/NewsScraper';
import { scrapeUrls } from '../../config/puppeteer';
import { PuppeteerBrowser } from './PuppeteerBrowser';
import { updateExistingArticlesByProvider } from '../../services/article';
import { isTestEnv } from '../utils';

const MAX_RETRIES = 2;

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

    private isFrameDetachedError(error: unknown): boolean {
        return error instanceof Error && error.message.includes('frame was detached');
    }

    private async getFreshBrowser(): Promise<Browser> {
        await PuppeteerBrowser.closeInstance();
        return PuppeteerBrowser.getInstance();
    }

    private async extractArticles(options: ScraperOptions, retryCount = 0): Promise<ScrapingRsp> {
        const strategyKey = this.extractStrategyKey(options.url);
        const extractionStrategy = this.strategyFactory.getStrategy(strategyKey);

        const browser = await PuppeteerBrowser.getInstance();

        const page = await browser.newPage();

        try {
            await page.goto(options.url, {
                waitUntil: 'domcontentloaded',
                timeout: options.timeout ?? 60000,
            });

            const articleUrls = await extractionStrategy.extractArticleUrls(page);

            // Close listing page before processing articles to free memory
            await this.safeClosePage(page);

            const articles: (NewsArticle | null)[] = [];

            // Process articles sequentially to avoid browser overload
            for (const articleUrl of articleUrls.slice(0, options.maxArticles ?? 4)) {
                const articleBrowser = await PuppeteerBrowser.getInstance();
                const articlePage = await articleBrowser.newPage();
                try {
                    await articlePage.goto(articleUrl, {
                        waitUntil: 'networkidle2',
                        timeout: options.timeout ?? 30000,
                    });

                    const content = await extractionStrategy.extractArticleContent(articlePage);
                    articles.push({ url: articleUrl, content, provider: strategyKey });
                } catch (error) {
                    console.error(`Failed to scrape ${articleUrl}:`, error);
                    if (this.isFrameDetachedError(error)) {
                        await this.getFreshBrowser();
                    }
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

            await this.safeClosePage(page);

            // Retry with a fresh browser if frame was detached
            if (this.isFrameDetachedError(error) && retryCount < MAX_RETRIES) {
                console.log(`Retrying ${options.url} with fresh browser (attempt ${retryCount + 1}/${MAX_RETRIES})`);
                await this.getFreshBrowser();
                return this.extractArticles(options, retryCount + 1);
            }

            throw error;
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
        if (hostname.includes('journalducoin')) return 'journalducoin';
        if (hostname.includes('cointribune')) return 'cointribune';
        throw new Error(`No strategy found for URL: ${url}`);
    }
}
