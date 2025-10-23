# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the source
COPY . .

# # Copy .env file (quan trọng!)
# # Nếu .env nằm cùng thư mục với Dockerfile
# COPY .env .env

# Expose port
EXPOSE 3002

# Start app
CMD ["node", "index.js"]
