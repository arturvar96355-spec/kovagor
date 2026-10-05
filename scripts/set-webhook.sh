#!/usr/bin/env bash
# Проверяет настройки Telegram-бота и подключает вебхук (запускать после того, как сайт открывается по https):
#   bash scripts/set-webhook.sh
# Node ставить не нужно — скрипт запускается в Docker.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Нет файла .env — сначала: bash scripts/init-env.sh"; exit 1; }

DOMAIN=$(grep -E '^SITE_DOMAIN=' .env | cut -d= -f2)
docker run --rm -v "$PWD":/w -w /w node:22-bookworm-slim node --env-file=.env scripts/telegram-setup.mjs "https://$DOMAIN"
