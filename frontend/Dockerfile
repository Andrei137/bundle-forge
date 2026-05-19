# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Pin pnpm via corepack so builds are reproducible regardless of the host's setup.
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Dependency layer — cached unless package.json or lockfile change
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Vite bakes these into the static bundle at build time
ARG VITE_API_URL=http://localhost:8080
ARG VITE_STRIPE_PUBLISHABLE_KEY=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

COPY . .
RUN pnpm build

# ---- Runtime stage (static files served by Nginx) ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
