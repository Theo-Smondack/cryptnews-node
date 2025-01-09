import { NewsScraper } from '../../lib/classes/NewsScraper';

describe('News scraper Test', () => {
  it('should return an array of NewArticles', async () => {
    const newsScraper = new NewsScraper(['https://coinacademy.fr/actualites/']);
    const articles = await newsScraper.scrape();
    expect(articles[0]).toHaveProperty('url');
    expect(articles[0]).toHaveProperty('content');
    expect(articles).not.toHaveLength(0);
  }, 60000);

  it('should throw an error if url strategy is not found', async () => {
    const newsScraper = new NewsScraper(['https://example.com']);
    await expect(newsScraper.scrape()).rejects.toThrow('No strategy found for URL: https://example.com');
  }, 60000);
});
