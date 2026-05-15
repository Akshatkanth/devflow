import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@devflow/shared';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, validate(RegisterSchema), authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validate(LoginSchema), authController.login);

// POST /api/auth/refresh
router.post('/refresh', validate(RefreshTokenSchema), authController.refresh);

// POST /api/auth/logout  (requires auth)
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me  (requires auth)
router.get('/me', authenticate, authController.me);

export default router;
