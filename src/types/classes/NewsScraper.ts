export interface ScraperOptions {
    url: string;
    maxArticles?: number;
    timeout?: number;
}

export interface NewsArticle {
    url: string;
    provider: string;
    content: string[];
}

export interface ScrapingRsp {
    success: boolean;
    error?: string;
}
