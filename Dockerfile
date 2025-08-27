FROM node:20-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build:prod

RUN wget -O dist/games_history.json https://raw.githubusercontent.com/eventlab-dev/games-history/refs/heads/main/games_history.json

RUN rm -f dist/version.json && \
    VERSION=$(node -p "require('./package.json').version") && \
    echo "{ \"version\": \"$VERSION\" }" > dist/version.json

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
