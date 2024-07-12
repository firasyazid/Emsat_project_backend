FROM node:18

WORKDIR /usr/src/Userservice

COPY package*.json ./

RUN npm install -g jest

COPY . .

EXPOSE 3003

CMD ["nodemon", "index.js"]
