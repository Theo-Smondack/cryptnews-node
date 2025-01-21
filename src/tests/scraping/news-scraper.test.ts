import { NewsScraper } from '../../lib/classes/NewsScraper';

describe('News scraper Test', () => {
  it('should return an array of NewArticles', async () => {
    const newsScraper = new NewsScraper(['https://coinacademy.fr/actualites/']);
    await expect(newsScraper.scrape()).resolves.toEqual({ success: true });
  }, 60000);

  it('should throw an error if url strategy is not found', async () => {
    const newsScraper = new NewsScraper(['https://example.com']);
    await expect(newsScraper.scrape()).rejects.toThrow('No strategy found for URL: https://example.com');
  }, 60000);
});
