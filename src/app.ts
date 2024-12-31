import express from 'express';
import router from './routes';
import helmet from 'helmet';

const app = express();

app.use(express.json());
app.use(helmet());
app.use('/', router);

export default app;
