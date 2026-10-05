// Настройка бота после заполнения .env:
//   node --env-file=.env scripts/telegram-setup.mjs https://kovagor.ru        — проверить настройки и подключить вебхук
//   node --env-file=.env scripts/telegram-setup.mjs --find-group              — показать чаты, где бот видел сообщения (чтобы узнать TELEGRAM_GROUP_ID)
const token = process.env.TELEGRAM_BOT_TOKEN
const group = Number(process.env.TELEGRAM_GROUP_ID)
const secret = process.env.TELEGRAM_WEBHOOK_SECRET
const username = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, '')
const arg = process.argv[2]
const base = (process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org').replace(/\/$/, '')

if (!token) {
  console.error('Не задан TELEGRAM_BOT_TOKEN в .env')
  process.exit(1)
}
const call = async (method, params = {}) => {
  const r = await fetch(`${base}/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params) })
  const j = await r.json()
  if (!j.ok) throw new Error(`${method}: ${j.error_code} ${j.description}`)
  return j.result
}
const ok = (m) => console.log(`✅ ${m}`)
const bad = (m) => {
  console.log(`❌ ${m}`)
  process.exitCode = 1
}

const me = await call('getMe')
ok(`Бот найден: @${me.username}`)

if (arg === '--find-group') {
  const hook = await call('getWebhookInfo')
  if (hook.url) console.log('⚠️ Вебхук уже установлен — getUpdates не сработает. Сначала: curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook"')
  const updates = await call('getUpdates', { timeout: 0 })
  const chats = new Map()
  for (const u of updates) {
    const c = u.message?.chat ?? u.my_chat_member?.chat
    if (c) chats.set(c.id, `${c.type} «${c.title ?? c.username ?? c.first_name}»${c.is_forum ? ' [темы включены]' : ''}`)
  }
  if (!chats.size) console.log('Пока ничего нет: добавьте бота в группу и напишите там любое сообщение, затем запустите снова.')
  for (const [id, t] of chats) console.log(`${id}  ${t}`)
  process.exit()
}

if (!username) bad('Не задан TELEGRAM_BOT_USERNAME')
else if (username.toLowerCase() !== me.username.toLowerCase()) bad(`TELEGRAM_BOT_USERNAME=${username}, а у токена бот @${me.username}`)
if (!secret || secret.length < 16) bad('TELEGRAM_WEBHOOK_SECRET должен быть случайной строкой от 16 символов (openssl rand -hex 24)')
if (!group) bad('Не задан TELEGRAM_GROUP_ID (запустите с --find-group)')

if (group) {
  try {
    const chat = await call('getChat', { chat_id: group })
    if (chat.type !== 'supergroup') bad(`Чат «${chat.title}» — не супергруппа`)
    else if (!chat.is_forum) bad(`В группе «${chat.title}» не включены темы (Настройки группы → Темы)`)
    else ok(`Группа «${chat.title}»: супергруппа с темами`)
    const m = await call('getChatMember', { chat_id: group, user_id: me.id })
    if (m.status !== 'administrator') bad('Бот должен быть администратором группы')
    else if (!m.can_manage_topics) bad('Администратору-боту нужно право «Управление темами»')
    else ok('У бота есть право управлять темами')
  } catch (e) {
    bad(`Группа недоступна: ${e.message}`)
  }
}

if (process.exitCode) {
  console.log('\nИсправьте пункты выше и запустите снова.')
  process.exit()
}

if (arg?.startsWith('http')) {
  // за ретранслятором вебхук принимает он (TELEGRAM_WEBHOOK_URL), иначе — сам сайт
  const url = process.env.TELEGRAM_WEBHOOK_URL ?? `${arg.replace(/\/$/, '')}/api/telegram`
  await call('setWebhook', { url, secret_token: secret, allowed_updates: ['message'] })
  await call('setMyCommands', { commands: [{ command: 'start', description: 'Начать переписку' }] })
  const info = await call('getWebhookInfo')
  ok(`Вебхук: ${info.url}${info.last_error_message ? `  (последняя ошибка: ${info.last_error_message})` : ''}`)
} else {
  console.log('\nНастройки верны. Чтобы подключить вебхук, укажите адрес сайта: node --env-file=.env scripts/telegram-setup.mjs https://kovagor.ru')
}
