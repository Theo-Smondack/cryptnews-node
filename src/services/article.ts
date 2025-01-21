import { NewsArticle } from '../types/classes/NewsScraper';
import prisma from '../prisma/prisma';
import { getArticlesRsp } from '../types/models/article';
import { Context, MockContext } from '../context';
import { Prisma } from '@prisma/client';
import { isTestEnv } from '../lib/utils';


export async function updateExistingArticlesByProvider(articles: NewsArticle[]): Promise<getArticlesRsp[]> {
  const provider = articles[0].provider;
  const existingArticles = await getArticlesByProvider(provider);
  const existingUrls = getExistingUrls(existingArticles);
  const newArticles = getNewArticles(existingUrls, articles);
  const obsoleteArticlesUrls = getObsoleteArticlesUrls(existingUrls, articles);
  await deleteArticlesByUrls(obsoleteArticlesUrls);
  return Promise.all(newArticles.map((article) => createArticle(article)));
}

export async function createArticle(article: NewsArticle, mockCtx?:MockContext,ctx?:Context): Promise<getArticlesRsp> {
  checkEnv(mockCtx, ctx);

  const data = parseArticleData(article);

  if (isTestEnv()) {
    createArticleMockResolvedValue(mockCtx!, data);
  }

  return (ctx?.prisma || prisma).article.create({ data } );
}

async function getArticlesByProvider(provider: string): Promise<getArticlesRsp[]> {
  return prisma.article.findMany({
    where: {
      provider,
    },
  });
}

async function deleteArticlesByUrls(urls: string[]): Promise<void> {
  await prisma.article.deleteMany({
    where: {
      url: {
        in: urls,
      },
    },
  });
}

function parseArticleData(article: NewsArticle) : Prisma.ArticleCreateInput  {
  return {
    content: parseContent(article.content),
    url: article.url,
    provider: article.provider,
  };
}

function parseContent(content: string[]): string {
  return content.join('').trim();
}

function checkEnv(mockCtx?: MockContext, ctx?: Context) {
  if (isTestEnv() && (!mockCtx || !ctx)) {
    throw new Error('You must provide a context object when running in test environment');
  } else if (!isTestEnv() && (mockCtx || ctx)) {
    throw new Error('You must not provide a context object when running in production environment');
  }
}

function createArticleMockResolvedValue(mockCtx: MockContext, articleInput: Prisma.ArticleCreateInput) {
  mockCtx.prisma.article.create.mockResolvedValue({
    id: '1',
    ...articleInput,
  });
}

export function getExistingUrls(existingArticles: getArticlesRsp[]): string[] {
  return existingArticles.map((article) => article.url);
}

export function getNewArticles(existingUrls: string[], articles: NewsArticle[]): NewsArticle[] {
  return articles.filter((article) => !existingUrls.includes(article.url));
}

export function getObsoleteArticlesUrls(existingUrls: string[], newArticles: NewsArticle[]): string[] {
  return existingUrls.filter((url) => !newArticles.some((article) => article.url === url));
}
