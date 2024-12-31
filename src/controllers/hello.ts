import { RequestHandler, Response, Request } from 'express';


export const getName : RequestHandler = (req: Request, res: Response) => {
  if (!req.query.name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  if (!/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(req.query.name as string)) {
    res.status(400).json({ error: 'Invalid name' });
    return;
  }

  res.status(200).json({ message: `Hello ${req.query.name} !` });
}
