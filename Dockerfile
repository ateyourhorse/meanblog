# DOCKER-VERSION 1.9.1

FROM nodesource/node:5.1.1

ADD package.json package.json
RUN npm install
ADD . .

EXPOSE 3000

CMD ["node","./bin/www"]
