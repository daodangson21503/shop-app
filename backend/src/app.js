const express = require('express');
const cors = require('cors');
const promClient = require('prom-client');
const errorHandler = require('./middlewares/error.middleware');
const routes = require('./routes/index');

const app = express();
app.use(cors());
app.use(express.json());

// --- Prometheus metrics ---
promClient.collectDefaultMetrics();

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);
app.use(errorHandler);

module.exports = app;