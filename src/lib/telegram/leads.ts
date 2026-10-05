import { TelegramError, esc } from './api'
import { makeStartParam } from './link'
import type { Deps } from './bot'

export type LeadInput = { name: string; contact: string; project: string; message: string }

const PROJECTS: Record<string, string> = { landing: 'Лендинг', studio: 'Сайт-студия', flagship: 'Эталон', other: 'не выбран' }

/**
 * Заявка с сайта: сохраняем, создаём тему в группе менеджеров и кладём туда карточку.
 * Возвращает ссылку, по которой клиент подключается к переписке в боте.
 * Заявка не должна теряться: если тема не создалась, шлём карточку в общий чат группы.
 */
export async function submitLead(deps: Deps, input: LeadInput): Promise<{ id: number; botLink: string }> {
  const { api, store, config } = deps
  const lead = store.createLead({ ...input, project: PROJECTS[input.project] ?? input.project })

  const card =
    `🆕 <b>Заявка №${lead.id}</b>\n` +
    `Имя: ${esc(lead.name)}\n` +
    `Контакт: ${esc(lead.contact)}\n` +
    `Тариф: ${esc(lead.project)}` +
    (lead.message ? `\n\n${esc(lead.message)}` : '') +
    `\n\n<i>Когда клиент откроет бота по ссылке с сайта, ваши сообщения в этой теме пойдут ему. /close — закрыть обращение.</i>`

  try {
    const topic = await api.call<{ message_thread_id: number }>('createForumTopic', { chat_id: config.groupId, name: `#${lead.id} ${lead.name}`.slice(0, 120) })
    store.createThread({ topic_id: topic.message_thread_id, lead_id: lead.id, client_chat_id: null, client_name: lead.name })
    await api.call('sendMessage', { chat_id: config.groupId, message_thread_id: topic.message_thread_id, text: card, parse_mode: 'HTML' })
  } catch (e) {
    // Telegram недоступен целиком (сеть/блокировка) — повторная отправка бессмысленна и только задержит ответ формы
    if (e instanceof TelegramError && e.code === 0) throw e
    console.error('[telegram] не удалось создать тему, шлём в общий чат', e)
    await api.call('sendMessage', { chat_id: config.groupId, text: card, parse_mode: 'HTML' })
  }

  return { id: lead.id, botLink: `https://t.me/${config.botUsername}?start=${makeStartParam(config.secret, lead.id)}` }
}
