# ---- Stage 1: install production dependencies ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install only production deps in an isolated stage so npm's cache and
# any build-time cruft never reach the final image.
COPY package*.json ./
RUN npm install --omit=dev

# ---- Stage 2: minimal runtime image ----
FROM node:20-alpine
WORKDIR /app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 5000

CMD ["npm", "start"]
