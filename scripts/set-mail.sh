#!/usr/bin/env bash
# Подключает отправку заявок на email (резервный канал, работает даже когда Telegram недоступен).
#   bash scripts/set-mail.sh
# Для Яндекс.Почты: сервер smtp.yandex.ru, порт 465, а в «пароль» нужно вставить ПАРОЛЬ ПРИЛОЖЕНИЯ
# (id.yandex.ru → Безопасность → Пароли приложений → Почта), а не обычный пароль от почты.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "Нет файла .env — сначала: bash scripts/init-env.sh"; exit 1; }

set_var() { # заменить или добавить строку КЛЮЧ=ЗНАЧЕНИЕ в .env (без sed: значение может содержать любые символы)
  { grep -v "^$1=" .env || true; echo "$1=$2"; } > .env.tmp && mv .env.tmp .env && chmod 600 .env
}

read -r -p "SMTP-сервер [smtp.yandex.ru]: " HOST; HOST=${HOST:-smtp.yandex.ru}
read -r -p "Порт [465]: " PORT; PORT=${PORT:-465}
read -r -p "Логин (адрес почты, с которой отправляем): " USER_
read -r -s -p "Пароль приложения (не отображается): " PASS; echo
read -r -p "Куда присылать заявки (можно несколько адресов через запятую): " TO

set_var SMTP_HOST "$HOST"
set_var SMTP_PORT "$PORT"
set_var SMTP_USER "$USER_"
set_var SMTP_PASS "$PASS"
set_var LEAD_EMAIL_TO "$TO"
chmod 600 .env
echo
echo "Готово. Применить: bash scripts/deploy.sh"
