import { Router } from 'express';
import * as projectsController from './projects.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { CreateProjectSchema, UpdateProjectSchema } from '@devflow/shared';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// GET  /api/projects
router.get('/', projectsController.listProjects);

// POST /api/projects
router.post('/', validate(CreateProjectSchema), projectsController.createProject);

// GET  /api/projects/:id
router.get('/:id', projectsController.getProject);

// PATCH /api/projects/:id
router.patch('/:id', validate(UpdateProjectSchema), projectsController.updateProject);

// DELETE /api/projects/:id
router.delete('/:id', projectsController.deleteProject);

// GET  /api/projects/:id/deployments
router.get('/:id/deployments', projectsController.getProjectDeployments);

export default router;
