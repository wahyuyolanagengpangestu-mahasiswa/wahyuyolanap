# ==============================================================================
# Dockerfile Multi-Stage Build: React Vite Frontend
# SLA Tracker Smart City Kota Bandar Lampung (UTS PPSI 2026)
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:23-alpine AS builder
WORKDIR /app

# Salin package manifests untuk layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Salin source code dan lakukan build produksi
COPY . ./
RUN npm run build

# Stage 2: Serve dengan Nginx Minimalis
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Bersihkan static files bawaan nginx
RUN rm -rf ./*

# Salin file hasil build Vite
COPY --from=builder /app/dist ./

# Salin konfigurasi Nginx reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

