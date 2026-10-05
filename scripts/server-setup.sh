#!/usr/bin/env bash
# Первичная настройка чистого сервера Ubuntu 22.04/24.04. Запускается один раз от root:
#   sudo bash scripts/server-setup.sh
# Ставит Docker, включает файрвол (открыты только SSH, 80, 443), защиту от подбора пароля и swap (нужен для сборки сайта на 2 ГБ памяти).
set -euo pipefail

[ "$(id -u)" = 0 ] || { echo "Запустите от root: sudo bash scripts/server-setup.sh"; exit 1; }
export DEBIAN_FRONTEND=noninteractive

echo "==> Обновление системы"
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl git ufw fail2ban openssl

echo "==> Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "==> Swap (запас памяти для сборки)"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Файрвол: открыты только SSH (22), 80 и 443"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Защита от подбора пароля (fail2ban)"
systemctl enable --now fail2ban

echo
echo "Готово. Следующий шаг: bash scripts/init-env.sh"
