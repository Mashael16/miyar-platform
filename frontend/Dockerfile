FROM node:20-alpine
WORKDIR /APP

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev","--", "--host"]