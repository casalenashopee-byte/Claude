#!/bin/sh
set -e

echo "Aplicando migrações do banco…"
node_modules/.bin/prisma migrate deploy

exec "$@"
