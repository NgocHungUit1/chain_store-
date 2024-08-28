
FROM --platform=$BUILDPLATFORM node:12.20-alpine as builder

RUN mkdir /project
WORKDIR /project

RUN apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*

RUN apk add --update --no-cache zip

RUN npm install -g @angular/cli@13.2.5
RUN npm install --save-dev @angular-devkit/build-angular
RUN npm install --save @popperjs/core

COPY package.json package-lock.json ./

RUN npm ci

COPY . .
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4201"]
