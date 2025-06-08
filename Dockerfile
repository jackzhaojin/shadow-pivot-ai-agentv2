# Use Node LTS base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install deps separately for better caching
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Build standalone Next.js
RUN npm run build

# Expose port and start the app
EXPOSE 3000
CMD ["npm", "start"]
