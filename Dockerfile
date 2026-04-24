FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]


## Ejecucion

#docker build -t ms_authentication .
#docker run -d -p 3001:3001 --name ms_authentication ms_authentication