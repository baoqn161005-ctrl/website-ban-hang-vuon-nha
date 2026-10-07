FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY backend/ ./
COPY database/ /app/database/
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
RUN mkdir -p /app/backend/uploads && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run setup && npm start"]
