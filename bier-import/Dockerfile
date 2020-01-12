# --- Release with Alpine ----
FROM node:12-alpine AS release
LABEL "repository"="https://github.com/bierteam/drinkn"
ENV NODE_ENV production
WORKDIR /app
COPY package*.json ./
COPY models ./models
COPY services ./services
COPY setup.js ./
COPY server.js ./
RUN npm install --only=production
USER node

CMD ["node", "server.js"]
