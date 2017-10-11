FROM ubuntu:16.04

RUN apt-get update && apt-get install -y sudo curl npm apt-utils
RUN curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
RUN apt-get install -y nodejs
#RUN ln -s /usr/bin/nodejs /usr/bin/node

# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list
RUN apt-get update && apt-get install -y mongodb-org

RUN echo "node version "`node -v`


RUN mkdir /app
COPY package.json /app
WORKDIR /app
RUN npm install

COPY . /app

EXPOSE 3001

CMD ["npm", "start"]