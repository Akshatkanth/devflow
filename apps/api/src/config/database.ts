import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // Allow global `var` declarations for singleton pattern in development
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });
}

// Singleton pattern: reuse client across hot-reloads in development
const prisma = globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export { prisma };
