import { Router } from 'express';
import * as deploymentsController from './deployments.controller';
import { authenticate } from '../../middleware/auth';
import { deployLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { TriggerDeploymentSchema } from '@devflow/shared';

const router = Router();

// All deployment routes require authentication
router.use(authenticate);

// POST /api/projects/:projectId/deployments  — trigger a new deployment
router.post(
  '/projects/:projectId/deployments',
  deployLimiter,
  validate(TriggerDeploymentSchema),
  deploymentsController.triggerDeployment
);

// GET  /api/deployments/:id  — get deployment details + status
router.get('/deployments/:id', deploymentsController.getDeployment);

// GET  /api/deployments/:id/logs  — get stored log lines (paginated)
router.get('/deployments/:id/logs', deploymentsController.getDeploymentLogs);

// POST /api/deployments/:id/cancel  — cancel an in-progress deployment
router.post('/deployments/:id/cancel', deploymentsController.cancelDeployment);

export default router;
