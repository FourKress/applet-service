import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const requestBody = JSON.parse(JSON.stringify(req.body));
      if (requestBody != {})
        console.log(
          `${new Date().toString()} - [Request] ${
            req.baseUrl
          } - ${JSON.stringify(requestBody)}`,
        );
    } catch (error) {}
    next();
  }
}
