# Stage 1: builder
FROM node:22-alpine AS builder
WORKDIR /app

# Cài build tools
RUN apk add --no-cache bash python3 make g++ git

COPY package*.json ./

# Cài tất cả dependencies, bao gồm dev
RUN npm install

# Cài typescript toàn cục (chắc chắn)
RUN npm install -g typescript

COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production stage
FROM node:22-alpine
WORKDIR /app

# Copy package.json để cài prod dependencies
COPY package*.json ./

# Chỉ cài production dependencies
RUN npm install --only=production

# Copy code đã build từ stage builder
COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
