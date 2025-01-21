import { getArticlesRsp } from '../../types/models/article';
import { NewsArticle } from '../../types/classes/NewsScraper';
import { getExistingUrls, getNewArticles, getObsoleteArticlesUrls } from '../../services/article';

describe('Article services tests', () => {
  const databaseArticles : getArticlesRsp[] = [
    {
      id: '1',
      content: 'This is a test article.',
      url: 'https://example.com',
      provider: 'example',
    },
    {
      id: '2',
      content: 'This is another test article.',
      url: 'https://example.com/2',
      provider: 'example',
    }
  ]

  const scrapedArticles : NewsArticle[] = [
    {
      content: ['This is another test article.'],
      url: 'https://example.com/2',
      provider: 'example',
    },
    {
      content: ['This is a test article.', 'This is another test article.'],
      url: 'https://example.com/3',
      provider: 'example',
    }
  ]

  it('should give me existing urls',  () => {
    const existingUrls = getExistingUrls(databaseArticles);
    expect(existingUrls).toEqual(['https://example.com', 'https://example.com/2']);
  });

  it('should give me new articles', () => {
    const existingUrls = getExistingUrls(databaseArticles);
    const newArticles = getNewArticles(existingUrls, scrapedArticles);
    expect(newArticles).toEqual([{
      content: ['This is a test article.', 'This is another test article.'],
      url: 'https://example.com/3',
      provider: 'example',
    }]);
  });

  it('should return obsolete articles url', () => {
    const existingUrls = getExistingUrls(databaseArticles);
    const obsoleteArticlesUrls = getObsoleteArticlesUrls(existingUrls, scrapedArticles);
    expect(obsoleteArticlesUrls).toEqual(['https://example.com']);
  });
});
