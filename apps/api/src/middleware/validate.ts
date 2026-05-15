import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory that validates request data against a Zod schema.
 * Replaces the request data with the parsed (coerced + defaulted) output.
 *
 * Usage: router.post('/route', validate(MySchema), controller)
 * Usage: router.get('/route', validate(QuerySchema, 'query'), controller)
 */
export function validate<T>(schema: ZodSchema<T>, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(422).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
      return;
    }

    // Replace with Zod-parsed output (includes defaults & coercions)
    (req as Record<string, unknown>)[target] = result.data;
    next();
  };
}
