import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import {
  ConflictError,
  UnauthorizedError,
  AppError,
} from '../../middleware/errorHandler';
import type { AuthTokens, JwtPayload, User } from '@devflow/shared';
import { UserRole } from '@devflow/shared';
import type { RegisterInput, LoginInput } from '@devflow/shared';

const BCRYPT_ROUNDS = 12;

// ─── Token Generation ─────────────────────────────────────────────────────────

function generateAccessToken(user: { id: string; email: string; role: string }): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role as UserRole,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export async function registerUser(
  input: RegisterInput
): Promise<{ user: User; tokens: AuthTokens }> {
  // Check for existing email
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const refreshToken = generateRefreshToken('temp'); // placeholder, updated below
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const dbUser = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name ?? null,
      refreshToken: refreshTokenHash,
    },
  });

  // Regenerate refresh token with actual user ID
  const finalRefreshToken = generateRefreshToken(dbUser.id);
  const finalRefreshHash = await bcrypt.hash(finalRefreshToken, 10);

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { refreshToken: finalRefreshHash },
  });

  const accessToken = generateAccessToken(dbUser);

  logger.info({ userId: dbUser.id, email: dbUser.email }, 'User registered');

  const user: User = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as UserRole,
    createdAt: dbUser.createdAt,
  };

  return { user, tokens: { accessToken, refreshToken: finalRefreshToken } };
}

export async function loginUser(
  input: LoginInput
): Promise<{ user: User; tokens: AuthTokens }> {
  const dbUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Timing-safe: always run bcrypt even if user doesn't exist
  const passwordToCheck = dbUser?.passwordHash ?? '$2a$12$invalidhashfortimingequalityonly';
  const isValid = await bcrypt.compare(input.password, passwordToCheck);

  if (!dbUser || !isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken(dbUser);
  const refreshToken = generateRefreshToken(dbUser.id);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { refreshToken: refreshTokenHash },
  });

  logger.info({ userId: dbUser.id }, 'User logged in');

  const user: User = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as UserRole,
    createdAt: dbUser.createdAt,
  };

  return { user, tokens: { accessToken, refreshToken } };
}

export async function refreshTokens(
  refreshToken: string
): Promise<AuthTokens> {
  let payload: { sub: string };

  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!dbUser || !dbUser.refreshToken) {
    throw new UnauthorizedError('Session expired, please log in again');
  }

  const isValid = await bcrypt.compare(refreshToken, dbUser.refreshToken);
  if (!isValid) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(dbUser);
  const newRefreshToken = generateRefreshToken(dbUser.id);
  const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { refreshToken: newRefreshHash },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  logger.info({ userId }, 'User logged out');
}

export async function getCurrentUser(userId: string): Promise<User> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    throw new AppError(404, 'User not found', 'NOT_FOUND');
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as UserRole,
    createdAt: dbUser.createdAt,
  };
}
