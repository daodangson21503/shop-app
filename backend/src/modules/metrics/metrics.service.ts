import { Injectable } from '@nestjs/common';
import { Registry, Histogram, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  public readonly register: Registry;
  public readonly httpDuration: Histogram<string>;

  constructor() {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });

    this.httpDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });
  }
}
