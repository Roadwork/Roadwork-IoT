FROM node:latest

WORKDIR /usr/src/app

# Install deps
RUN apt-get update

# Create Certificate
RUN apt-get install ca-certificates

# Install Package.json dependendencies
COPY package.json .
RUN npm install

# Copy Source Code
ADD . /usr/src/app

CMD [ "npm", "run", "start" ]