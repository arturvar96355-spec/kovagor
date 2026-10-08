#!/usr/bin/env bash
# Запуск на сервере с сайтом: создаёт секрет, по которому бот (Cloudflare Worker) забирает заявки с сайта.
#   bash scripts/set-lead-secret.sh
# Значение нужно один раз вставить в Cloudflare: Worker → Settings → Variables and Secrets → PULL_SECRET (тип Secret).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Нет файла .env — сначала: bash scripts/init-env.sh"; exit 1; }

set_var() { { grep -v "^$1=" .env || true; echo "$1=$2"; } > .env.tmp && mv .env.tmp .env && chmod 600 .env; }

SECRET=$(grep '^LEAD_PULL_SECRET=' .env | cut -d= -f2- || true)
if [ -z "$SECRET" ]; then SECRET=$(openssl rand -hex 24); set_var LEAD_PULL_SECRET "$SECRET"; fi
set_var TELEGRAM_BOT_USERNAME "kovagor_bot"

echo "Готово. Секрет сохранён в .env (LEAD_PULL_SECRET)."
echo
echo "Вставьте это значение в Cloudflare (Worker → Settings → Variables and Secrets):"
echo "  PULL_SECRET (тип Secret) = $SECRET"
echo "  SITE_URL (тип Text)      = https://$(grep '^SITE_DOMAIN=' .env | cut -d= -f2-)"
echo
echo "Не пересылайте значение секрета. Затем: bash scripts/deploy.sh"
