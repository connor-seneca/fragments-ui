# Stage 0: install dependencies and build
FROM node:18-alpine3.17 AS dependencies

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./

RUN npm install --save-dev parcel

# #######################################################################

#Stage 1: build the website
FROM node:18-alpine3.17 AS build

ENV NODE_ENV=production

WORKDIR /app

COPY --from=dependencies /app /app

COPY . .

#setting env variables
ARG AWS_COGNITO_POOL_ID=us-east-1_bxBEhXh1C \
    AWS_COGNITO_CLIENT_ID=1n0nbb3gkcorq0a3jq2nsmfrsf \
    AWS_COGNITO_HOSTED_UI_DOMAIN=csquires-fragments.auth.us-east-1.amazoncognito.com

RUN npm run build

# #######################################################################

# Stage 2: production using nginx
FROM nginx:stable-alpine@sha256:62cabd934cbeae6195e986831e4f745ee1646c1738dbd609b1368d38c10c5519 AS deploy

# Copy the files from the build stage to production
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]