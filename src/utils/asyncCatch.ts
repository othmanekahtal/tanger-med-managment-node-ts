import {Response, Request, NextFunction} from 'express'
export default (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next)
