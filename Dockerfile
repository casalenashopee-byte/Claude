# Build multi-stage enxuto para self-host (VPS, Fly.io, Railway…).
# Usa SQLite com volume persistente por padrão — veja docker-compose.yml.

FROM node:22-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL só precisa ser válido para o "prisma generate" gerar o client —
# a conexão real de runtime vem da env var passada ao container.
ENV DATABASE_URL="file:./build.db"
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# .prisma/client é onde fica o engine nativo gerado — a rastreabilidade do
# Next às vezes deixa passar; copiamos explícito para não quebrar em runtime.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
