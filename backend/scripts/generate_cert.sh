#!/bin/sh

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/server.key -out /certs/server.crt -subj "/CN=localhost"

if [ -f /certs/server.key ] && [ -f /certs/server.crt ]; then
  echo "¡Certificados SSL autofirmados generados y movidos correctamente!"
else
  echo "Error al generar los certificados SSL autofirmados"
fi
