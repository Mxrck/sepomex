FROM nginx:alpine

RUN apk add --no-cache jq sed

WORKDIR /app

COPY dist/api/versions.json /app/versions.json
COPY docker/nginx/vhost.conf /app/vhost.conf

ENV ACCESS_TOKEN=""

RUN LATEST_VERSION=$(jq -r '.data.versions[] | select(.is_latest == true) | .version' /app/versions.json) && \
    sed -i '/# *location ~ \/api\/latest(.*)\$ {/,/# *rewrite/ s/# *//g' /app/vhost.conf && \
    sed -i "s/{LATEST_VERSION}/$LATEST_VERSION/" /app/vhost.conf

RUN if [ -n "$ACCESS_TOKEN" ]; then \
      sed -i '/# *if (\$http_authorization != "Bearer {ACCESS_TOKEN}") {/,/# *return 401;/ s/# *//g' /app/vhost.conf && \
      sed -i "s/{ACCESS_TOKEN}/$ACCESS_TOKEN/" /app/vhost.conf; \
    fi

RUN cat /app/vhost.conf
RUN cp /app/vhost.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY dist .

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80