FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY shared/types ./shared/types

WORKDIR /app/backend
COPY backend/package.json ./package.json
COPY backend/prisma ./prisma

RUN npm install
RUN npm run prisma:generate || npx prisma generate

COPY backend/config ./config
COPY backend/src ./src
COPY backend/.env.example ./

ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "run", "start"]
