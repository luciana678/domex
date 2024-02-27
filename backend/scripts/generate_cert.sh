#!/bin/sh

# Obtener los nombres de los archivos de las variables de entorno
SERVER_KEY_NAME=${SERVER_KEY_NAME:-"server.key"}
SERVER_CERT_NAME=${SERVER_CERT_NAME:-"server.crt"}

printf $SERVER_CERT_NAME

printf "Generando certificados SSL autofirmados...\n"

# Verificar si /certs es un directorio
if [ ! -d /certs ]; then
  # Si /certs no es un directorio, intentar crearlo
  mkdir -p /certs
fi

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/$SERVER_KEY_NAME -out /certs/$SERVER_CERT_NAME -subj "/CN=localhost"

if [ -f /certs/$SERVER_KEY_NAME ] && [ -f /certs/$SERVER_CERT_NAME ]; then
  echo "¡Certificados SSL autofirmados generados y movidos correctamente!"
else
  echo "Error al generar los certificados SSL autofirmados"
  exit 1
fi
