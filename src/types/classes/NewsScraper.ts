export interface ScraperOptions {
    url: string;
    maxArticles?: number;
    timeout?: number;
}

export interface NewsArticle {
    url: string;
    content: string[];
}
