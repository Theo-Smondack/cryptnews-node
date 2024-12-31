import express from 'express';
import { getName } from './controllers';
import { appMiddleware, helloRouteMiddleware } from './middlewares';

const router = express.Router();

//Middlewares
router.use('/', appMiddleware);
router.use('/hello', helloRouteMiddleware);

//Routes
router.get('/hello', getName);

export default router;
