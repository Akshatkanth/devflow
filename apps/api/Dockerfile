# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ─── Dependencies stage ───────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci --workspace=apps/api --workspace=packages/shared --ignore-scripts

# ─── Build stage ─────────────────────────────────────────────────────────────
FROM deps AS builder
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN npm run build --workspace=apps/api

# ─── Production stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

# Copy only production artifacts
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package*.json ./
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/prisma ./prisma
COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=apiuser:nodejs /app/apps/api/node_modules ./apps/api/node_modules

USER apiuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]
