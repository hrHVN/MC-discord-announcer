# Build the dev files
FROM node:latest

WORKDIR /usr/share/app

COPY src/ ./

RUN npm i --omit=dev

#COPY src/ ./

CMD ["node", "app.js"]