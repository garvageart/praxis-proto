# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

CMD ["node", "build"]
