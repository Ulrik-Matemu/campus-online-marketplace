# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies like typescript)
RUN npm install

# Copy the rest of the source code
COPY . .

# Run the build
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy only the compiled code and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install ONLY production dependencies to keep the image small
RUN npm install --omit=dev

# Match this to your Express app port (3000 or 5000)
EXPOSE 3000 

CMD ["node", "dist/index.js"]