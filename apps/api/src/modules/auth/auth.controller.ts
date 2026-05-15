import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@devflow/shared';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = RegisterSchema.parse(req.body);
    const { user, tokens } = await authService.registerUser(input);

    res.status(201).json({
      success: true,
      data: { user, tokens },
      message: 'Account created successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = LoginSchema.parse(req.body);
    const { user, tokens } = await authService.loginUser(input);

    res.status(200).json({
      success: true,
      data: { user, tokens },
      message: 'Logged in successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshTokens(refreshToken);

    res.status(200).json({
      success: true,
      data: { tokens },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.logoutUser(req.user!.sub);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getCurrentUser(req.user!.sub);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}
