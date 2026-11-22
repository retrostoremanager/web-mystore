# Local/Podman-only image for full-stack testing -- runs Vite's own dev server (not a
# built+nginx-served bundle) so local edits hot-reload the same as running `npm run dev`
# outside a container. Not used for the real Azure Static Web Apps deploy.
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
