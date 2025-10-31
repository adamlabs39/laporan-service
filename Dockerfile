FROM node:23-alpine3.20
WORKDIR /adameds-laporan
COPY . .
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8088
RUN npm install

EXPOSE ${SERVER_PORT}/tcp
CMD [ "npm", "run", "start:prod" ]