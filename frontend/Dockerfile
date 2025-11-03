FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Start dev server, Important: Tell Vite to listen on all interfaces (--host)
CMD ["npm", "run", "dev", "--", "--host"]
