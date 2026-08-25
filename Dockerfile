# base image
FROM node:22-alpine AS base

WORKDIR /app

# deps
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# build
FROM base AS builder
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# run
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
USER nodejs
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]