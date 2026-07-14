import { Injectable, NestMiddleware } from '@nestjs/common';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class ServeStaticMiddleware implements NestMiddleware {
  private readonly uploadPath = resolve(process.cwd(), 'uploads');

  use(req: any, res: any, next: () => void) {
    const url = req.originalUrl || req.url || '';
    const relativePath = url.replace(/^\/uploads\//, '');
    const filePath = join(this.uploadPath, relativePath);
    if (existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  }
}
