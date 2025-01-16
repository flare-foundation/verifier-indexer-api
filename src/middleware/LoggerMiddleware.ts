import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, query: queryParams, baseUrl: path } = req;
    try {
      Logger.log(`Request: ${method} ${path} ${JSON.stringify(queryParams)}`);
    } catch (error) {
      Logger.warn(`Error logging request: ${error}`);
    }
    next();
  }
}
