import { configDotenv } from 'dotenv';
import app from './app';
import cron from 'node-cron';
import { getNews } from './jobs/getNews';

configDotenv();

const PORT = process.env.PORT || 8000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  cron.schedule('*/5 * * * *', async () => {
    console.log('Running getNews job');
    await getNews();
  });
}
