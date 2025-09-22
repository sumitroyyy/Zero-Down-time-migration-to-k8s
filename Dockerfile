FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build Docker image
docker build -t migration-demo:v1.0 .
