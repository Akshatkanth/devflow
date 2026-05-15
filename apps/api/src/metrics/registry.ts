import client from 'prom-client';

// Enable default Node.js metrics (event loop lag, heap, GC, etc.)
const register = client.register;
client.collectDefaultMetrics({ register });

// ─── Custom Metrics ───────────────────────────────────────────────────────────

export const deploymentsTotal = new client.Counter({
  name: 'devflow_deployments_total',
  help: 'Total number of deployments triggered',
  labelNames: ['status', 'framework'] as const,
  registers: [register],
});

export const deploymentDuration = new client.Histogram({
  name: 'devflow_deployment_duration_seconds',
  help: 'Deployment pipeline duration in seconds',
  labelNames: ['framework', 'status'] as const,
  buckets: [5, 10, 15, 20, 30, 45, 60, 90, 120],
  registers: [register],
});

export const activeDeployments = new client.Gauge({
  name: 'devflow_active_deployments',
  help: 'Number of deployments currently running',
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'devflow_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'devflow_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  registers: [register],
});

export const websocketConnections = new client.Gauge({
  name: 'devflow_websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

export { register };
