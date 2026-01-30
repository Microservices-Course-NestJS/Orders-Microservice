FROM node:22.19-alpine3.22

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY prisma* ./prisma/
RUN npx prisma generate

COPY . .


EXPOSE 3002