FROM dony435/pnpm:20-alpine

WORKDIR /app

RUN apk update
RUN apk add bash

COPY docker/scripts/wait-for-it.sh /usr/local/bin/wait-for-it.sh
COPY package.json .
COPY pnpm-lock.yaml .

RUN chmod +x /usr/local/bin/wait-for-it.sh
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["wait-for-it", "mongodb:27017", "--", "pnpm", "run", "build"]
