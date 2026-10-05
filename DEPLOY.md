# Запуск kovagor.ru

Схема: VPS в России → Docker (Next.js + Caddy) → домен с REG.RU. Caddy сам получает и продлевает HTTPS-сертификат.

## 1. Сервер
Любой VPS на Ubuntu 22.04/24.04, от 1 vCPU / 2 ГБ RAM (REG.RU «Облачный VPS», Timeweb, Selectel). Сервер в РФ нужен для скорости и под 152-ФЗ (заявки содержат персональные данные).
Запишите **IPv4-адрес** сервера.

## 2. DNS на REG.RU
Личный кабинет → Домены → kovagor.ru → «Управление зонами DNS» (должны стоять NS REG.RU: ns1.reg.ru / ns2.reg.ru).
Удалите парковочные A/AAAA-записи и добавьте:

| Тип | Имя | Значение |
|---|---|---|
| A | @ | IP сервера |
| A | www | IP сервера |

Проверка: `dig +short kovagor.ru` или https://dnschecker.org — должен вернуться IP сервера (обычно 5–60 минут).

## 3. Подготовка сервера (один раз)
```bash
ssh root@IP
apt update && apt -y upgrade
curl -fsSL https://get.docker.com | sh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```
(Дальше лучше работать не под root: создайте пользователя `deploy`, добавьте в группу `docker`, отключите вход root по паролю — см. VPS_SETUP_GUIDE из вашего пакета.)

## 4. Выкладка
```bash
git clone https://github.com/arturvar96355-spec/kovagor.git && cd kovagor
git checkout claude/pensive-wright-o875av   # или main после слияния
cp .env.example .env && nano .env            # SITE_DOMAIN, NEXT_PUBLIC_SITE_URL, токен бота
docker compose up -d --build
docker compose logs -f caddy                 # ждём «certificate obtained»
```
Репозиторий приватный: клонируйте по SSH-ключу (deploy key) или токеном.
Проверка: https://kovagor.ru, форма заявки, https://kovagor.ru/sitemap.xml.

## 5. Telegram для заявок
@BotFather → /newbot → токен в `TELEGRAM_BOT_TOKEN`. Напишите боту любое сообщение, затем откройте `https://api.telegram.org/bot<TOKEN>/getUpdates` и возьмите `chat.id` → `TELEGRAM_CHAT_ID`. Применить: `docker compose up -d`.

## 6. Обновление сайта
```bash
cd kovagor && git pull && docker compose up -d --build
```

## Перед публичным запуском
- Заменить `TODO(content)` и `TODO(legal)` (реквизиты, тексты юр. страниц, тарифы, контакты) — `grep -rn "TODO(" src`.
- Подключить Яндекс.Метрику и cookie-баннер.
- Если нужно закрыть сайт до готовности — добавьте basic-auth в Caddyfile (как в pcstrela, папка `gate/`).

## Временно: Vercel
1. vercel.com → Add New → Project → импортировать `arturvar96355-spec/kovagor` (Vercel должен иметь доступ к этому GitHub-аккаунту).
2. Production Branch: `claude/pensive-wright-o875av` (Settings → Git), либо сначала слить ветку в `main`.
3. Framework Preset: Next.js (определяется сам). Environment Variables: `NEXT_PUBLIC_NOINDEX=1` (закрыть от поисковиков), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, при желании `NEXT_PUBLIC_SITE_URL`.
4. Deploy. Тариф Hobby — только некоммерческое использование, для временного показа подходит.
5. Домен (по желанию): Settings → Domains → kovagor.ru. На REG.RU: A-запись `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com` (актуальные значения покажет сам Vercel).
6. Когда сайт готов: переезд на VPS (разделы выше), убрать `NEXT_PUBLIC_NOINDEX`.
