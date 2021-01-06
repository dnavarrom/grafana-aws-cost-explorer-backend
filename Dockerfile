FROM node:12
RUN mkdir /code /code/lib /code/config
COPY ./lib/ /code/lib/
COPY ./config/ /code/config
COPY ./index.js /code
COPY ./package.json /code
EXPOSE 8090
WORKDIR /code
RUN npm install
CMD ["node", "/code/index.js"]
