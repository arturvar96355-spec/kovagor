#!/usr/bin/env bash
# Запуск на РОССИЙСКОМ сервере (с сайтом): направляет весь обмен с Telegram через зарубежный ретранслятор.
#   bash scripts/set-relay.sh tg.kovagor.ru
set -euo pipefail
cd "$(dirname "$0")/.."
RELAY=${1:?Укажите адрес ретранслятора, например: bash scripts/set-relay.sh tg.kovagor.ru}
[ -f .env ] || { echo "Нет файла .env — сначала: bash scripts/init-env.sh"; exit 1; }

set_var() { # заменить или добавить строку КЛЮЧ=ЗНАЧЕНИЕ в .env (без sed: значение может содержать любые символы)
  { grep -v "^$1=" .env || true; echo "$1=$2"; } > .env.tmp && mv .env.tmp .env && chmod 600 .env
}
set_var TELEGRAM_API_BASE "https://$RELAY"
set_var TELEGRAM_WEBHOOK_URL "https://$RELAY/hook"

echo "Готово: .env обновлён (обмен с Telegram пойдёт через https://$RELAY)."
echo
echo "Эти значения понадобятся на зарубежном сервере (bash relay/init.sh):"
echo "  IP российского сервера: $(curl -4 -sS -m 10 https://ifconfig.me 2>/dev/null || echo 'узнайте в панели хостинга')"
echo "  Секрет вебхука: значение строки TELEGRAM_WEBHOOK_SECRET из файла .env (посмотреть: grep TELEGRAM_WEBHOOK_SECRET .env)"
echo
echo "Дальше: bash scripts/deploy.sh   и после запуска ретранслятора:   bash scripts/set-webhook.sh"
