FROM node:12
RUN mkdir /code
WORKDIR /code
ADD ./lib/ /code/lib/
ADD ./config/ /code/config
ADD ./index.js /code/
ADD ./package.json /code/
EXPOSE 8090
RUN npm install
CMD ["node", "/code/index.js"]
