import { TelegramError, esc, type TgApi } from './api'
import { parseStartParam } from './link'
import type { Store, Thread } from './store'
import type { BotConfig, TgMessage, TgUpdate, TgUser } from './types'
import { rateLimit } from '@/lib/rate-limit'

export type Deps = { api: TgApi; store: Store; config: BotConfig }

const fullName = (u?: TgUser) => [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.username || 'Клиент'
const topicTitle = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, 120)

const WELCOME = (siteUrl: string) =>
  `Здравствуйте! Это бот студии KOVAGOR. Напишите здесь свой вопрос или задачу — менеджер ответит в этом чате.\n\nОтправляя сообщения, вы соглашаетесь на обработку персональных данных: ${siteUrl}/privacy`

async function say(api: TgApi, chatId: number, text: string, threadId?: number, html = false) {
  await api.call('sendMessage', { chat_id: chatId, text, message_thread_id: threadId, parse_mode: html ? 'HTML' : undefined, disable_web_page_preview: true })
}

/** Создаёт тему в группе для клиента, который написал боту сам (без заявки с сайта). */
async function openThreadForClient(deps: Deps, msg: TgMessage): Promise<Thread> {
  const { api, store, config } = deps
  const u = msg.from
  const label = topicTitle(`${fullName(u)}${u?.username ? ` (@${u.username})` : ''}`)
  const topic = await api.call<{ message_thread_id: number }>('createForumTopic', { chat_id: config.groupId, name: label })
  store.createThread({ topic_id: topic.message_thread_id, lead_id: null, client_chat_id: msg.chat.id, client_name: fullName(u) })
  await say(
    api,
    config.groupId,
    `💬 Новый клиент написал боту напрямую: ${esc(fullName(u))}${u?.username ? ` (@${esc(u.username)})` : ''}\nОтвечайте в этой теме — сообщения уйдут клиенту.\n/close — закрыть обращение.`,
    topic.message_thread_id,
    true,
  )
  return store.threadByTopic(topic.message_thread_id)!
}

/** Сообщение клиента из личного чата с ботом → в его тему в группе. */
async function handleClient(deps: Deps, msg: TgMessage) {
  const { api, store, config } = deps
  const text = msg.text ?? ''

  if (text.startsWith('/start')) {
    const param = text.split(/\s+/)[1]
    const leadId = param ? parseStartParam(config.secret, param) : null
    if (leadId) {
      const thread = store.threadByLead(leadId)
      const lead = store.getLead(leadId)
      if (thread && lead) {
        store.linkClient(thread.topic_id, msg.chat.id)
        await say(api, msg.chat.id, `Здравствуйте, ${lead.name}! Ваша заявка №${lead.id} получена. Менеджер ответит вам здесь, в этом чате.\n\n${config.siteUrl}/privacy — как мы обрабатываем данные.`)
        await say(api, config.groupId, `✅ Клиент подключился в Telegram${msg.from?.username ? `: @${esc(msg.from.username)}` : ''}. Теперь ваши сообщения в этой теме уходят ему.`, thread.topic_id, true)
        return
      }
    }
    await say(api, msg.chat.id, WELCOME(config.siteUrl))
    return
  }

  // защита от спама: тема создаётся на сообщение, поэтому ограничиваем поток от одного чата
  if (!rateLimit(`tg:${msg.chat.id}`, 30, 60_000)) return

  let thread = store.openThreadByClient(msg.chat.id)
  const isNew = !thread
  if (!thread) thread = await openThreadForClient(deps, msg)

  try {
    await api.call('copyMessage', { chat_id: config.groupId, message_thread_id: thread.topic_id, from_chat_id: msg.chat.id, message_id: msg.message_id })
  } catch (e) {
    // тему могли удалить вручную — пересоздаём и пробуем ещё раз
    if (e instanceof TelegramError && /thread|topic/i.test(e.description)) {
      store.closeThread(thread.topic_id)
      thread = await openThreadForClient(deps, msg)
      await api.call('copyMessage', { chat_id: config.groupId, message_thread_id: thread.topic_id, from_chat_id: msg.chat.id, message_id: msg.message_id })
    } else throw e
  }
  if (isNew) await say(api, msg.chat.id, 'Спасибо! Сообщение получено, менеджер ответит здесь.')
}

/** Сообщение менеджера в теме группы → клиенту. */
async function handleManager(deps: Deps, msg: TgMessage) {
  const { api, store, config } = deps
  const topicId = msg.message_thread_id
  if (!topicId) return // «Общая» тема — не переписка с клиентом
  if (msg.from?.is_bot || msg.via_bot) return
  if (msg.forum_topic_created || msg.forum_topic_closed || msg.forum_topic_reopened || msg.forum_topic_edited) return

  const thread = store.threadByTopic(topicId)
  if (!thread) return

  if (msg.text?.startsWith('/close')) {
    store.closeThread(topicId)
    await api.call('closeForumTopic', { chat_id: config.groupId, message_thread_id: topicId }).catch(() => {})
    if (thread.client_chat_id) await say(api, thread.client_chat_id, 'Обращение закрыто. Если появятся вопросы — просто напишите сюда, мы откроем новое.').catch(() => {})
    return
  }
  if (msg.text?.startsWith('/')) return // прочие команды не пересылаем клиенту

  if (!thread.client_chat_id) {
    const lead = thread.lead_id ? store.getLead(thread.lead_id) : undefined
    await say(api, config.groupId, `⚠️ Клиент ещё не открыл бота, сообщение не доставлено.${lead ? ` Свяжитесь по контакту: ${esc(lead.contact)}` : ''}`, topicId, true)
    return
  }

  try {
    await api.call('copyMessage', { chat_id: thread.client_chat_id, from_chat_id: config.groupId, message_id: msg.message_id })
    await api.call('setMessageReaction', { chat_id: config.groupId, message_id: msg.message_id, reaction: [{ type: 'emoji', emoji: '👍' }] }).catch(() => {})
  } catch (e) {
    const reason = e instanceof TelegramError && e.isBlocked ? 'клиент заблокировал бота' : 'ошибка отправки'
    await say(api, config.groupId, `⚠️ Не доставлено: ${reason}.`, topicId)
  }
}

/** Точка входа вебхука. Ошибки не пробрасываем: Telegram повторял бы доставку, а дубль сообщения хуже потери. */
export async function handleUpdate(deps: Deps, update: TgUpdate) {
  const msg = update.message
  if (!msg) return
  if (msg.chat.type === 'private') return handleClient(deps, msg)
  if (msg.chat.id === deps.config.groupId) return handleManager(deps, msg)
  // сообщения из других групп игнорируем: бот работает только со своей группой менеджеров
}
