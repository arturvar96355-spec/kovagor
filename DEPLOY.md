# Запуск kovagor.ru на своём сервере (VPS)

Схема: сервер в России → Docker (сайт + Caddy) → домен с REG.RU. Caddy сам получает и продлевает HTTPS-сертификат. На сервере работает и Telegram-бот с перепиской менеджеров и клиентов (`docs/TELEGRAM.md`).

## 1. Купить сервер
- ОС: **Ubuntu 24.04** (или 22.04), без панелей управления, «чистая».
- Ресурсы: **2 vCPU, 2–4 ГБ RAM, 30+ ГБ диск (SSD/NVMe)**. Меньше 2 ГБ — сборка сайта может не пройти.
- Расположение: Россия (Москва/Санкт-Петербург): быстро для клиентов и корректно для 152-ФЗ.
- Где: REG.RU («Облачный VPS»), Timeweb Cloud, Selectel — по цене/удобству; примерно 500–1000 ₽/мес.
- Запишите **IP-адрес** сервера и **пароль root** (или добавьте SSH-ключ, если умеете).

## 2. Направить домен на сервер (REG.RU)
Личный кабинет → Домены → kovagor.ru → «DNS-серверы и управление зоной» (должны стоять `ns1.reg.ru`, `ns2.reg.ru`).
Удалите парковочные записи **A/AAAA/CNAME** для `@` и `www` (записи **MX/TXT** не трогайте — это почта) и добавьте:

| Тип | Имя | Значение |
|---|---|---|
| A | @ | IP сервера |
| A | www | IP сервера |

Проверка: https://dnschecker.org — для `kovagor.ru` должен показаться IP сервера (5–60 минут).

## 3. Доступ к репозиторию с сервера
Репозиторий приватный. Создайте токен только на чтение:
GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate:
- Repository access: **Only select repositories → kovagor**;
- Permissions → Repository permissions → **Contents: Read-only**;
- Expiration: 90 дней. Скопируйте токен (показывается один раз) и **никому не пересылайте**.

## 4. Подключиться и настроить сервер
С компьютера (Windows: «Терминал»/PowerShell; macOS/Linux: Терминал):
```bash
ssh root@IP_СЕРВЕРА
```
Дальше на сервере:
```bash
git clone -b claude/pensive-wright-o875av https://ВАШ_ТОКЕН@github.com/arturvar96355-spec/kovagor.git
cd kovagor
bash scripts/server-setup.sh     # ставит Docker, файрвол, защиту от подбора пароля (5–10 минут)
bash scripts/init-env.sh         # спросит домен, токен бота, имя бота, id группы; создаст .env
bash scripts/deploy.sh           # собирает и запускает сайт (первый раз 5–10 минут)
```
Когда `deploy.sh` закончит, сайт откроется на https://kovagor.ru (сертификат Caddy выпускает сам, если DNS уже указывает на сервер; иначе он повторит попытку, когда DNS обновится: смотрите `docker compose logs -f caddy`).

## 5. Подключить Telegram-бота
**Сначала проверьте, достаёт ли сервер до Telegram:**
```bash
curl -m 10 -sS -o /dev/null -w "telegram: %{http_code}\n" https://api.telegram.org/
```
Если выводится `telegram: 000` (таймаут) — Telegram с этого сервера закрыт; пропустите команду ниже и сделайте ретранслятор: `docs/TELEGRAM.md`, раздел «Если сервер в России и Telegram недоступен». Заявки в любом случае можно получать на email: `bash scripts/set-mail.sh`.

Если код `200`/`302` — подключаем бота напрямую:
```bash
bash scripts/set-webhook.sh
```
Скрипт проверит бота и группу (темы, права) и подключит вебхук, либо подскажет, что исправить. Подробности и как узнать id группы — `docs/TELEGRAM.md`.

## 6. Проверка
Откройте https://kovagor.ru, примите cookie, отправьте тестовую заявку → в группе появится тема → нажмите «Продолжить в Telegram» → ответьте в теме.

## Обновление сайта
```bash
cd kovagor && bash scripts/deploy.sh
```

## Резервная копия
Переписка и связи заявок хранятся в Docker-томе `kovagor_appdata` (файл `bot.sqlite`). Копия: `docker run --rm -v kovagor_appdata:/d -v "$PWD":/b alpine tar czf /b/appdata-backup.tgz -C /d .`

## Безопасность (после первого запуска)
- Лучше входить по SSH-ключу и отключить вход по паролю.
- Токен GitHub можно удалить после клонирования (для обновлений понадобится новый).
- Файл `.env` содержит секреты: не пересылайте его и не коммитьте.

## Перед публичным запуском
- Заменить `TODO(content)` и `TODO(legal)` (реквизиты, тексты юр. страниц, тарифы, контакты): `grep -rn "TODO(" src`.
- Открыть сайт поисковикам: удалить строку `NEXT_PUBLIC_NOINDEX=1` из `.env` и выполнить `bash scripts/deploy.sh`.
- Добавить `kovagor.ru` в настройки счётчика Яндекс.Метрики.
