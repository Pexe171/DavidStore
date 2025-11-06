FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma

RUN npm install
RUN npm run prisma:generate || npx prisma generate

COPY config ./config
COPY src ./src
COPY prisma ./prisma
COPY .env.example ./

ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "run", "start"]
