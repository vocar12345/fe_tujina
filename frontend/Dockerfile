# ---- build stage: compile the Angular app ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- serve stage: static files via Nginx (no Node runtime shipped) ----
FROM nginx:1.27-alpine
# default.conf.template is rendered by the nginx image's envsubst at startup,
# substituting ${BFF_URL} only (nginx's own $vars are preserved).
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
ENV BFF_URL=http://bff:3000
EXPOSE 80
