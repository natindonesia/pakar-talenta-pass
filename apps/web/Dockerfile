# Container image for the Pakar Talenta Pass web app (Next.js, standalone output).
# Build from the repo root:  docker build -t pakar-talenta-pass-web -f apps/web/Dockerfile .
FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN npm ci --no-audit --no-fund

FROM base AS builder
# Workspace packages can keep their own node_modules (e.g. packages/mail/node_modules/nodemailer).
# .dockerignore excludes node_modules from the context, so bring them from the deps stage.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN npm run build --workspace=@pakar-talenta/web

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
WORKDIR /app
# Standalone output mirrors the monorepo root: the server lives at apps/web/server.js.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "apps/web/server.js"]
