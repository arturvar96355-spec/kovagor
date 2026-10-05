#!/usr/bin/env bash
# Запуск на ЗАРУБЕЖНОМ сервере (Ubuntu): создаёт настройки и поднимает ретранслятор Telegram.
#   sudo bash scripts/server-setup.sh   (один раз, ставит Docker и файрвол)
#   bash relay/init.sh
set -euo pipefail
cd "$(dirname "$0")"

read -r -p "Адрес ретранслятора (поддомен, смотрящий на ЭТОТ сервер), например tg.kovagor.ru: " RELAY_DOMAIN
read -r -p "IP российского сервера с сайтом: " SITE_SERVER_IP
read -r -p "Домен сайта [kovagor.ru]: " SITE_DOMAIN
SITE_DOMAIN=${SITE_DOMAIN:-kovagor.ru}
read -r -s -p "Секрет вебхука (значение TELEGRAM_WEBHOOK_SECRET из .env сайта): " WEBHOOK_SECRET; echo

umask 177
cat > .env <<EOF
RELAY_DOMAIN=$RELAY_DOMAIN
SITE_SERVER_IP=$SITE_SERVER_IP
SITE_DOMAIN=$SITE_DOMAIN
WEBHOOK_SECRET=$WEBHOOK_SECRET
EOF

docker compose up -d
echo
echo "Ретранслятор запущен: https://$RELAY_DOMAIN (сертификат появится в течение минуты, если DNS уже указывает на этот сервер)."
echo "Проверка: curl -sS https://$RELAY_DOMAIN/   → должно ответить ok"
echo "Логи: docker compose logs -f caddy"
