FROM node:23-alpine3.20
WORKDIR /adameds-laporan
COPY . .
ENV APP_HOST=0.0.0.0
ENV APP_PORT=3001
RUN npm install

EXPOSE 3000/tcp
CMD [ "npm", "run", "start:prod" ]