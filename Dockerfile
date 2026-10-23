# Gunakan OS Node.js versi 18
FROM node:18

# Install Chromium untuk menjalankan Puppeteer di Linux
RUN apt-get update && apt-get install -y chromium

# Atur folder kerja
WORKDIR /app

# Salin package.json dan install library
COPY package*.json ./
RUN npm install

# Salin semua sisa kodinganmu
COPY . .

# [PENTING] Build aplikasi Next.js-nya dulu
RUN npm run build

# Beritahu Railway port mana saja yang digunakan
EXPOSE 3000
EXPOSE 3005

# Jalankan Bot WA di background (&) lalu jalankan Next.js di depan
CMD ["sh", "-c", "node index.js & npm start"]