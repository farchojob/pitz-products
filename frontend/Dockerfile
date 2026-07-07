# --- build stage ---
FROM node:22-slim AS build
WORKDIR /app

# Baked in at build time (Vite inlines VITE_ vars). Defaults to the compose API URL.
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- serve stage ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
