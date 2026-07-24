FROM node:20-alpine

WORKDIR /app

# App source lives in frontend/app, so install deps from there.
COPY app/package*.json ./
RUN npm install

COPY app .

EXPOSE 5175

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5175"]
