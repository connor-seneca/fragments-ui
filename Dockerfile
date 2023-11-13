# Stage 0: install dependencies and build
FROM node:18-alpine3.17 as build

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci \
    npm install parcel

# Copy the application code
COPY . .

ENV NODE_ENV=production

# Build the static website
#CMD ["npm", "run", "build"]
RUN npm run build

# #######################################################################

# Stage 1: production using nginx
FROM nginx:stable-alpine

# Copy the files from the build stage to production
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]