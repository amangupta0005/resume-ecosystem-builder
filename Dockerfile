# ==========================================
# Multi-Stage Lean Dockerfile for Next.js App
# Target: AWS EC2 / Low-Memory Containers
# ==========================================

# Stage 1: Base runtime
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# Stage 3: Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Dummy DB URL for build-time schema generation
ENV DATABASE_URL="postgresql://build_user:build_pass@localhost:5432/build_db"

RUN npx prisma generate
RUN npm run build

# Stage 4: Production Runner (ultra-lightweight ~130MB)
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root security user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and traced standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
