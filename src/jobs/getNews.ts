import { NewsScraper } from '../lib/classes/NewsScraper';

interface GetNewsResponse {
  error?: string;
  success?: boolean;
}

export async function getNews(): Promise<GetNewsResponse> {
  try {
    const newsScraper = new NewsScraper();

    const articles = await newsScraper.scrape();

    console.log(articles);

    return { success: true };

  } catch (error) {
    console.error(error);
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
