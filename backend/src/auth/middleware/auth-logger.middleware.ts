import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('AuthLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const authorization = req.get('Authorization');

    if (authorization) {
      this.logger.log(
        `${method} ${originalUrl} - ${ip} - ${userAgent} - Token: ${authorization.substring(0, 20)}...`,
      );
    }

    next();
  }
}
