import { Controller, Get, Injectable, Res, UseInterceptors, NestMiddleware } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Controller()
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.metricsService.register.contentType);
    res.end(await this.metricsService.register.metrics());
  }
}

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const end = this.metricsService.httpDuration.startTimer();
    res.on('finish', () => {
      end({ method: req.method, route: req.path, status: String(res.statusCode) });
    });
    next();
  }
}
