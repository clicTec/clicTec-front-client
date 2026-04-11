FROM node:22.19.0 AS build

WORKDIR /opt/app

ARG PRERENDER_API_BASE=https://api.clictec.es
ENV PRERENDER_API_BASE=${PRERENDER_API_BASE}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.28.0-alpine3.21

ENV API_UPSTREAM=https://api.clictec.es

COPY --from=build /opt/app/dist/front-client/browser/. /usr/share/nginx/html

RUN mkdir -p /etc/nginx/templates \
  && printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '' \
  '  location /api/ {' \
  '    resolver 127.0.0.11 ipv6=off;' \
  '    set $api_upstream ${API_UPSTREAM};' \
  '    proxy_pass $api_upstream;' \
  '    proxy_http_version 1.1;' \
  '    proxy_set_header Host $host;' \
  '    proxy_set_header X-Real-IP $remote_addr;' \
  '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
  '    proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;' \
  '    proxy_set_header X-Forwarded-Host $host;' \
  '  }' \
  '' \
  '  location / {' \
  '    try_files $uri $uri/ =404;' \
  '  }' \
  '}' > /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
