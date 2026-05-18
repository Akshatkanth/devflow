# DevFlow - Changelog

## [1.0.0] - End of Phase 1
### Added
- **Monorepo:** Initialized Turborepo with `@devflow/shared`, `apps/api`, and `apps/web`.
- **Backend API:** Built Express API with Prisma, PostgreSQL, and comprehensive JWT Auth.
- **Deployment Queue:** Integrated BullMQ and Redis for processing deployment jobs asynchronously.
- **Live Logs:** Integrated Socket.io for real-time log streaming from worker to frontend.
- **Frontend App:** Built Next.js 15 app with shadcn/ui, including Login, Dashboard, Project Detail, and Live Log Viewer pages.
- **Observability:** Added Prometheus `/metrics` endpoint, Grafana provisioning with custom dashboards, and Pino structured logging.
- **Infrastructure:** Provided a complete `docker-compose.yml` encapsulating Nginx, Postgres, Redis, API, Prometheus, Grafana, and pgAdmin.
- **CI/CD:** Created GitHub Actions workflow for linting, testing, Docker builds, and Trivy security scanning.
- **Tests:** Wrote Jest integration tests for Auth and Project routes.

## [1.0.1] - Local Deployment Preview Enhancement
### Added
- **Deployment Preview Screenshots:** After a deployment passes health checks, the worker captures a local homepage screenshot with Playwright and stores it in `apps/api/storage/previews`.
- **Deployment Metadata:** Persisted preview screenshot path, public URL, and capture timestamp on the `Deployment` record.
- **Frontend Preview Card:** Added a deployment details screenshot panel with a fallback state when no preview is available.

### Changed
- **Deployment Pipeline:** Kept the existing BullMQ flow, logs, WebSocket events, simulated build stages, and health checks intact while adding screenshot capture as a non-blocking post-success step.
