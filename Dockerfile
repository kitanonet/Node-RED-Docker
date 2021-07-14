FROM node:lts as build

RUN apt-get update \
  && apt-get install -y build-essential python perl-modules

RUN deluser --remove-home node \
  && groupadd --gid 1000 nodered \
  && useradd --gid nodered --uid 1000 --shell /bin/bash --create-home nodered

RUN mkdir -p /data && chown 1000 /data

USER 1000
WORKDIR /data

COPY ./package.json /data/
RUN npm install

VOLUME /data

## Release image
FROM node:lts-slim

RUN apt-get update && apt-get install -y perl-modules && rm -rf /var/lib/apt/lists/*

RUN deluser --remove-home node \
  && groupadd --gid 1000 nodered \
  && useradd --gid nodered --uid 1000 --shell /bin/bash --create-home nodered

RUN mkdir -p /data && chown 1000 /data

USER 1000

COPY ./server.js /data/
COPY ./settings.js /data/
COPY ./flows.json /data/
COPY ./flows_cred.json /data/
COPY ./package.json /data/
COPY --from=build /data/node_modules /data/node_modules

RUN mkdir /data/customModules 
COPY customModules /data/customModules


USER 0

RUN chgrp -R 0 /data \
  && chmod -R g=u /data



WORKDIR /data
RUN npm install node-red-contrib-opcua
RUN npm install ./customModules/collect-variables/
RUN npm install ./customModules/select-variables/

USER 1000

ENV PORT 1880
ENV NODE_ENV=production
ENV NODE_PATH=/data/node_modules
EXPOSE 1880

VOLUME /data

CMD ["node", "/data/server.js", "/data/flows.json"]
