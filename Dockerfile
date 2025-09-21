# Build the dev files
FROM node:latest

WORKDIR /usr/share/app

COPY src/package.json ./
RUN npm i --omit=dev

COPY src/ ./

EXPOSE 443

CMD ["node", "app.js"]