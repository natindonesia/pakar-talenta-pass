# Container image for the delivery worker (BullMQ). Build from the repo root:
#   docker build -t pakar-talenta-pass-worker -f packages/worker/Dockerfile .
FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN npm ci --no-audit --no-fund

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/packages ./packages
COPY --chown=nextjs:nodejs package.json ./
COPY --chown=nextjs:nodejs packages ./packages
USER nextjs
CMD ["node_modules/.bin/tsx", "packages/worker/src/index.ts"]
