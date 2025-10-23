# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of source
COPY . .

# Expose port (thay đổi tùy service)
EXPOSE 3003

# Start app
CMD ["node", "index.js"]
