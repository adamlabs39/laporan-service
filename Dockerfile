FROM node:25-alpine3.22
WORKDIR /adameds-laporan
COPY . .
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8088
RUN npm install

EXPOSE ${SERVER_PORT}/tcp
CMD [ "npm", "run", "start:prod" ]