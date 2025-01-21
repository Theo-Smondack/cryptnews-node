import { Context, createMockContext, MockContext } from '../../context';
import { createArticle } from '../../services/article';
let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

const fakeContent = [
  'This is a test article.',
  '',
  'This is another test article.',
  '',
  '',
]

describe('Article collection tests', () => {
  it('should create a new article', async () => {
    await expect(createArticle({
      content: fakeContent,
      url: 'https://example.com',
      provider: 'example',
    }, mockCtx,ctx)).resolves.toEqual({
      id: '1',
      content: 'This is a test article.This is another test article.',
      url: 'https://example.com',
      provider: 'example',
    });
  });

  it('should throw an error if no context is provided in test environment', async () => {
    await expect(createArticle({
      content: fakeContent,
      url: 'https://example.com',
      provider: 'example',
    })).rejects.toThrow('You must provide a context object when running in test environment');
  });
});
