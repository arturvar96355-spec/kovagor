#!/usr/bin/env bash
# Интерактивно создаёт файл настроек .env (токен бота не показывается на экране и не попадает в историю команд).
#   bash scripts/init-env.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  read -r -p ".env уже существует. Перезаписать? [y/N] " yn
  [ "$yn" = "y" ] || { echo "Отменено."; exit 0; }
fi

read -r -p "Домен сайта [kovagor.ru]: " DOMAIN
DOMAIN=${DOMAIN:-kovagor.ru}

echo
echo "Telegram-бот (токен выдаёт @BotFather; он не будет виден на экране при вводе)"
read -r -s -p "Токен бота: " TOKEN; echo
read -r -p "Имя бота без @ (например kovagor_bot): " BOT
BOT=${BOT#@}
read -r -p "ID группы менеджеров (число вида -100..., можно оставить пустым и добавить позже): " GROUP
SECRET=$(openssl rand -hex 24)

umask 177
cat > .env <<EOF
SITE_DOMAIN=$DOMAIN
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
# Пока на сайте заглушки — закрыто от поисковиков. Для открытия удалите строку и пересоберите: bash scripts/deploy.sh
NEXT_PUBLIC_NOINDEX=1
TELEGRAM_BOT_TOKEN=$TOKEN
TELEGRAM_BOT_USERNAME=$BOT
TELEGRAM_GROUP_ID=$GROUP
TELEGRAM_WEBHOOK_SECRET=$SECRET
EOF

echo
echo "Файл .env создан (права: только владелец)."
[ -n "$GROUP" ] || echo "⚠️  ID группы не указан: переписка с клиентами заработает после того, как вы добавите TELEGRAM_GROUP_ID в .env (nano .env) и выполните bash scripts/deploy.sh."
echo "Следующий шаг: bash scripts/deploy.sh"
