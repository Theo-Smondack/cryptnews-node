import { NextFunction, RequestHandler, Response, Request } from 'express';

export { helloRouteMiddleware } from './hello';

const appMiddleware: RequestHandler = (req: Request, res: Response,next: NextFunction) => {
  if (req.path === '/') {
    res.redirect('/hello');
  }
  next();
}

export { appMiddleware };
