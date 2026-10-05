#!/usr/bin/env bash
# Сборка и запуск (или обновление) сайта:  bash scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "Нет файла .env — сначала выполните: bash scripts/init-env.sh"; exit 1; }

# подтянуть свежий код (если сервер настроен на получение обновлений из репозитория)
git pull --ff-only 2>/dev/null || echo "(git pull пропущен)"

docker compose up -d --build
docker image prune -f >/dev/null
docker compose ps
echo
echo "Готово. Логи сайта: docker compose logs -f app   |   Логи HTTPS/Caddy: docker compose logs -f caddy"
