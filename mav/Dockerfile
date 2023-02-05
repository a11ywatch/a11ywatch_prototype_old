FROM jeffmendez19/tensorflow-node-gpu

WORKDIR /usr/src/app

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -y nodejs

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN  npm run build

CMD [ "node", "dist/index.js"]


# FROM jeffmendez19/tensorflow-node-gpu

# WORKDIR /usr/src/app

# # copy from build image
# COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
# COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
# COPY --from=BUILD_IMAGE /usr/src/app/.env ./.env

# CMD [ "node", "dist/index.js"]

