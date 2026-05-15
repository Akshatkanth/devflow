import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Project Schemas ──────────────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(64, 'Project name must be at most 64 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name contains invalid characters'),
  repoUrl: z
    .string()
    .url('Must be a valid URL')
    .regex(
      /^https:\/\/github\.com\/.+\/.+/,
      'Must be a valid GitHub repository URL (https://github.com/owner/repo)'
    ),
  branch: z.string().min(1, 'Branch is required').default('main'),
  description: z.string().max(256, 'Description too long').optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// ─── Deployment Schemas ───────────────────────────────────────────────────────

export const TriggerDeploymentSchema = z.object({
  commitMessage: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type TriggerDeploymentInput = z.infer<typeof TriggerDeploymentSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
