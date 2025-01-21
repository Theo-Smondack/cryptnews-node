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
        try {
            await Promise.all(
              this.urls.map(async (url) => {
                  await this.extractArticles({ url });
              }),
            );
            return { success: true };
        } catch (error) {
            throw error;
        }
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
            const articles = await Promise.all(
                articleUrls.slice(0, options.maxArticles ?? 4).map(async (articleUrl) => {
                    const articlePage = await browser.newPage();
                    try {
                        await articlePage.goto(articleUrl, {
                            waitUntil: 'networkidle0',
                            timeout: options.timeout ?? 30000,
                        });

                        const content = await extractionStrategy.extractArticleContent(articlePage);
                        return { url: articleUrl, content, provider: strategyKey };
                    } catch (error) {
                        console.error(`Failed to scrape ${articleUrl}:`, error);
                        return null;
                    } finally {
                        await articlePage.close();
                    }
                }),
            );
            const filteredArticles = articles.filter((article): article is NewsArticle => article !== null);
            if (!isTestEnv()) {
                await updateExistingArticlesByProvider(filteredArticles);
            }
            return { success: true };
        } catch (error) {
            console.error('Failed to scrape data:', error);
            throw error;
        } finally {
            await page.close();
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
