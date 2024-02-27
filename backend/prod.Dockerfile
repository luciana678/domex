# Utiliza la imagen de Node.js como base
FROM node:18.17-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de configuración y de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instala las dependencias
RUN npm install

# Copia el código fuente de la aplicación
COPY . .

# Compila el código TypeScript a JavaScript
RUN npm run compile

# Ejecutar la aplicación
CMD ["npm", "start"]
