// Telegram-бот «посредник» на Cloudflare Workers (без сервера, бесплатно).
// Клиент нажимает «Старт» и соглашается на обработку данных → бот создаёт для него тему в группе менеджеров.
// Всё, что клиент пишет, попадает в его тему; всё, что менеджер пишет в теме, бот отправляет клиенту от своего имени.
// Сообщение менеджера, начинающееся с точки («.заметка»), клиенту НЕ отправляется — это внутренняя заметка.
//
// Переменные Worker: BOT_TOKEN (Secret), WEBHOOK_SECRET (Secret), GROUP_ID (Text, id супергруппы с темами, вида -100…),
// CONSENT_URL (Text, по умолчанию https://kovagor.ru/consent), GREETING (Text, необязательно). Хранилище: KV-привязка с именем KV.

const API = (env, method, body) =>
  fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

const TARIFFS = {
  landing: 'Лендинг (от 5 000 ₽)',
  studio: 'Сайт-студия (от 15 000 ₽)',
  flagship: 'Эталон (от 30 000 ₽)',
}

// Тариф приходит с сайта в /start <тариф>; запоминаем до согласия и сообщаем менеджерам, когда тема создана
async function announce(env, user) {
  const key = await env.KV.get(`p:${user.id}`)
  if (!key || !TARIFFS[key]) return
  const thread = await ensureTopic(env, user)
  await API(env, 'sendMessage', { chat_id: env.GROUP_ID, message_thread_id: thread, text: `Выбранный на сайте тариф: ${TARIFFS[key]}` })
  await env.KV.delete(`p:${user.id}`)
}

const GREETING = 'Здравствуйте! Это бот студии KOVAGOR. Напишите, что вам нужно, — мы ответим здесь же.'

async function ensureTopic(env, user) {
  const known = await env.KV.get(`c:${user.id}`)
  if (known) return Number(known)
  const name = [user.first_name, user.username && `@${user.username}`].filter(Boolean).join(' ').slice(0, 120) || `Клиент ${user.id}`
  const r = await API(env, 'createForumTopic', { chat_id: env.GROUP_ID, name })
  if (!r.ok) throw new Error(`createForumTopic: ${r.description}`)
  const thread = r.result.message_thread_id
  await env.KV.put(`c:${user.id}`, String(thread))
  await env.KV.put(`t:${thread}`, String(user.id))
  await API(env, 'sendMessage', {
    chat_id: env.GROUP_ID,
    message_thread_id: thread,
    text: `Новый клиент: ${name}\nПишите в этой теме — бот отправит сообщение клиенту. Начните сообщение с точки, чтобы оставить внутреннюю заметку.`,
  })
  return thread
}

async function fromClient(env, msg) {
  const user = msg.from
  const start = /^\/start(?:\s+(\S+))?/.exec(msg.text || '')
  if (start && start[1] && TARIFFS[start[1]]) await env.KV.put(`p:${user.id}`, start[1], { expirationTtl: 86400 })
  const consent = await env.KV.get(`a:${user.id}`)
  const consentUrl = env.CONSENT_URL || 'https://kovagor.ru/consent'
  if (!consent) {
    await API(env, 'sendMessage', {
      chat_id: msg.chat.id,
      text: 'Чтобы мы могли вам ответить, нужно согласие на обработку персональных данных (ваш Telegram-профиль и сообщения).',
      reply_markup: { inline_keyboard: [[{ text: 'Читать согласие', url: consentUrl }], [{ text: 'Согласен(на)', callback_data: 'agree' }]] },
    })
    return
  }
  if (start) {
    const picked = await env.KV.get(`p:${user.id}`)
    const note = picked && TARIFFS[picked] ? `\n\nВы выбрали тариф: ${TARIFFS[picked]}. Опишите коротко задачу — ответим здесь.` : ''
    await API(env, 'sendMessage', { chat_id: msg.chat.id, text: (env.GREETING || GREETING) + note })
    await announce(env, user)
    return
  }
  let thread = await ensureTopic(env, user)
  let r = await API(env, 'copyMessage', { chat_id: env.GROUP_ID, from_chat_id: msg.chat.id, message_id: msg.message_id, message_thread_id: thread })
  if (!r.ok && /thread/i.test(r.description || '')) {
    // тему удалили вручную — создаём заново
    await env.KV.delete(`c:${user.id}`)
    thread = await ensureTopic(env, user)
    r = await API(env, 'copyMessage', { chat_id: env.GROUP_ID, from_chat_id: msg.chat.id, message_id: msg.message_id, message_thread_id: thread })
  }
}

async function fromManager(env, msg) {
  if (msg.from?.is_bot || !msg.message_thread_id) return
  if (msg.forum_topic_created || msg.forum_topic_edited || msg.forum_topic_closed || msg.forum_topic_reopened) return
  if ((msg.text || msg.caption || '').startsWith('.')) return // внутренняя заметка
  const clientId = await env.KV.get(`t:${msg.message_thread_id}`)
  if (!clientId) return
  const r = await API(env, 'copyMessage', { chat_id: Number(clientId), from_chat_id: msg.chat.id, message_id: msg.message_id })
  if (!r.ok) {
    await API(env, 'sendMessage', {
      chat_id: msg.chat.id,
      message_thread_id: msg.message_thread_id,
      text: `Не удалось отправить клиенту: ${r.description}. Возможно, он заблокировал бота.`,
    })
  }
}

async function handle(env, update) {
  if (update.callback_query?.data === 'agree') {
    const q = update.callback_query
    await env.KV.put(`a:${q.from.id}`, new Date().toISOString())
    await API(env, 'answerCallbackQuery', { callback_query_id: q.id })
    const picked = await env.KV.get(`p:${q.from.id}`)
    const note = picked && TARIFFS[picked] ? `\n\nВы выбрали тариф: ${TARIFFS[picked]}. Опишите коротко задачу — ответим здесь.` : ''
    await API(env, 'sendMessage', { chat_id: q.message.chat.id, text: (env.GREETING || GREETING) + note })
    await announce(env, q.from)
    return
  }
  const msg = update.message
  if (!msg) return
  if (msg.chat.type === 'private') await fromClient(env, msg)
  else if (String(msg.chat.id) === String(env.GROUP_ID)) await fromManager(env, msg)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // одноразовая настройка: открыть в браузере https://<worker>/setup?secret=<WEBHOOK_SECRET>
    if (url.pathname === '/setup') {
      if (url.searchParams.get('secret') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 })
      const r = await API(env, 'setWebhook', {
        url: `${url.origin}/hook`,
        secret_token: env.WEBHOOK_SECRET,
        allowed_updates: ['message', 'callback_query'],
      })
      return new Response(JSON.stringify(r, null, 2), { headers: { 'content-type': 'application/json' } })
    }

    if (url.pathname === '/hook' && request.method === 'POST') {
      if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 })
      try {
        await handle(env, await request.json())
      } catch (e) {
        console.error(e)
      }
      return new Response('ok') // всегда 200, чтобы Telegram не повторял доставку
    }
    return new Response('ok')
  },
}
