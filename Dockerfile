# Build the dev files
FROM node:latest

WORKDIR /usr/share/app

COPY src/package*.json ./

RUN npm ci --omit=dev

COPY src/ ./

CMD ["node", "app.js"]