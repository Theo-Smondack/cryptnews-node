import { Prisma } from '@prisma/client';

const articlePrisma = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  select: { id: true, content: true, url: true, provider: true },
});

export type getArticlesRsp = Prisma.ArticleGetPayload<typeof articlePrisma>;
