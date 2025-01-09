import { NewsExtractionStrategyFactory } from './NewsExtractionStrategyFactory';
import { NewsArticle, ScraperOptions } from '../../types/classes/NewsScraper';
import { scrapeUrls } from '../../config/puppeteer';
import { PuppeteerBrowser } from './PuppeteerBrowser';

export class NewsScraper {
    private strategyFactory: NewsExtractionStrategyFactory = new NewsExtractionStrategyFactory();
    private urls: string[] = [];

    constructor(urls?: string[]) {
        this.urls = urls || scrapeUrls;
    }

    async scrape(): Promise<NewsArticle[]> {
        const articles: NewsArticle[] = [];
        await Promise.all(
            this.urls.map(async (url) => {
                articles.push(...(await this.extractArticles({ url })));
            }),
        );
        return articles;
    }

    private async extractArticles(options: ScraperOptions): Promise<NewsArticle[]> {
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
                        return { url: articleUrl, content };
                    } catch (error) {
                        console.error(`Failed to scrape ${articleUrl}:`, error);
                        return null;
                    } finally {
                        await articlePage.close();
                    }
                }),
            );
            return articles.filter((article): article is NewsArticle => article !== null);
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
