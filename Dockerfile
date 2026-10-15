# Stage 1: Build the Vue 3 + Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve using high-performance Nginx Alpine
FROM nginx:1.25-alpine

# Copy custom Nginx configuration for Vue SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
