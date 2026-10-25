FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs oci.mjs ./
COPY public ./public
ENV HOST=0.0.0.0 PORT=4173
USER node
EXPOSE 4173
CMD ["node", "server.mjs"]
