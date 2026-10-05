import { beforeEach, describe, expect, it } from 'vitest'
import { TelegramError, type TgApi } from './api'
import { handleUpdate, type Deps } from './bot'
import { submitLead } from './leads'
import { makeStartParam, parseStartParam } from './link'
import { Store } from './store'
import type { TgMessage } from './types'

const GROUP = -1001
const CLIENT = 555
const SECRET = 'test-secret-test-secret-test-secret'

type Call = { method: string; params: Record<string, unknown> }

function fakeApi() {
  const calls: Call[] = []
  let nextTopic = 100
  const failures: Array<(c: Call) => Error | null> = []
  const api: TgApi = {
    async call<T>(method: string, params: Record<string, unknown> = {}) {
      const c = { method, params }
      for (const f of failures) {
        const err = f(c)
        if (err) throw err
      }
      calls.push(c)
      return (method === 'createForumTopic' ? { message_thread_id: nextTopic++ } : true) as T
    },
  }
  return { api, calls, failures, sent: (m: string) => calls.filter((c) => c.method === m) }
}

let n = 1
const msg = (over: Partial<TgMessage> & { chat: TgMessage['chat'] }): TgMessage => ({ message_id: n++, ...over })
const fromClient = (text: string, extra: Partial<TgMessage> = {}) =>
  msg({ chat: { id: CLIENT, type: 'private' }, from: { id: CLIENT, first_name: 'Иван', username: 'ivan' }, text, ...extra })
const fromManager = (topic: number | undefined, text: string, extra: Partial<TgMessage> = {}) =>
  msg({ chat: { id: GROUP, type: 'supergroup' }, from: { id: 1, first_name: 'Менеджер' }, message_thread_id: topic, text, ...extra })

let deps: Deps
let fake: ReturnType<typeof fakeApi>
const upd = (m: TgMessage) => ({ update_id: n++, message: m })

beforeEach(() => {
  fake = fakeApi()
  deps = { api: fake.api, store: new Store(':memory:'), config: { groupId: GROUP, botUsername: 'kovagor_bot', secret: SECRET, siteUrl: 'https://kovagor.ru' } }
})

describe('deep-link', () => {
  it('подпись защищает номер заявки', () => {
    const p = makeStartParam(SECRET, 42)
    expect(parseStartParam(SECRET, p)).toBe(42)
    expect(parseStartParam(SECRET, 'lead_42_AAAAAAAAAAAA')).toBeNull()
    expect(parseStartParam('другой-секрет', p)).toBeNull()
    expect(parseStartParam(SECRET, 'lead_x_y')).toBeNull()
    expect(makeStartParam(SECRET, 42).length).toBeLessThanOrEqual(64)
  })
})

describe('заявка с сайта', () => {
  it('создаёт тему и карточку, отдаёт ссылку на бота', async () => {
    const r = await submitLead(deps, { name: 'Иван <b>', contact: '@ivan', project: 'studio', message: 'нужен сайт' })
    expect(r.botLink).toMatch(/^https:\/\/t\.me\/kovagor_bot\?start=lead_1_/)
    const topic = fake.sent('createForumTopic')[0].params
    expect(topic).toMatchObject({ chat_id: GROUP })
    const card = fake.sent('sendMessage')[0].params
    expect(card.message_thread_id).toBe(100)
    expect(card.text).toContain('Сайт-студия')
    expect(card.text).toContain('Иван &lt;b&gt;') // HTML экранируется
    expect(deps.store.threadByLead(1)?.client_chat_id).toBeNull()
  })

  it('если тему создать нельзя — карточка уходит в общий чат, заявка не теряется', async () => {
    fake.failures.push((c) => (c.method === 'createForumTopic' ? new TelegramError('createForumTopic', 400, 'not a forum') : null))
    const r = await submitLead(deps, { name: 'Иван', contact: '@ivan', project: 'landing', message: '' })
    expect(r.id).toBe(1)
    const card = fake.sent('sendMessage')[0].params
    expect(card.message_thread_id).toBeUndefined()
    expect(card.chat_id).toBe(GROUP)
  })
})

describe('клиент подключается по ссылке', () => {
  it('валидная ссылка связывает чат с темой', async () => {
    const { botLink } = await submitLead(deps, { name: 'Иван', contact: '@ivan', project: 'studio', message: '' })
    fake.calls.length = 0
    await handleUpdate(deps, upd(fromClient(`/start ${botLink.split('start=')[1]}`)))
    expect(deps.store.threadByLead(1)?.client_chat_id).toBe(CLIENT)
    expect(fake.sent('sendMessage').map((c) => c.params.chat_id)).toEqual([CLIENT, GROUP])
  })

  it('подделанная ссылка не связывает и показывает приветствие', async () => {
    await submitLead(deps, { name: 'Иван', contact: '@ivan', project: 'studio', message: '' })
    fake.calls.length = 0
    await handleUpdate(deps, upd(fromClient('/start lead_1_AAAAAAAAAAAA')))
    expect(deps.store.threadByLead(1)?.client_chat_id).toBeNull()
    expect(fake.sent('sendMessage')).toHaveLength(1)
  })
})

describe('переписка', () => {
  async function connected() {
    const { botLink } = await submitLead(deps, { name: 'Иван', contact: '@ivan', project: 'studio', message: '' })
    await handleUpdate(deps, upd(fromClient(`/start ${botLink.split('start=')[1]}`)))
    fake.calls.length = 0
  }

  it('сообщение клиента копируется в его тему', async () => {
    await connected()
    const m = fromClient('Привет!')
    await handleUpdate(deps, upd(m))
    expect(fake.sent('copyMessage')[0].params).toMatchObject({ chat_id: GROUP, message_thread_id: 100, from_chat_id: CLIENT, message_id: m.message_id })
    expect(fake.sent('createForumTopic')).toHaveLength(0) // новая тема не создаётся
  })

  it('ответ менеджера в теме уходит клиенту и получает реакцию', async () => {
    await connected()
    const m = fromManager(100, 'Добрый день!')
    await handleUpdate(deps, upd(m))
    expect(fake.sent('copyMessage')[0].params).toMatchObject({ chat_id: CLIENT, from_chat_id: GROUP, message_id: m.message_id })
    expect(fake.sent('setMessageReaction')).toHaveLength(1)
  })

  it('если клиент ещё не открыл бота — менеджер видит предупреждение с контактом', async () => {
    await submitLead(deps, { name: 'Иван', contact: '@ivan', project: 'studio', message: '' })
    fake.calls.length = 0
    await handleUpdate(deps, upd(fromManager(100, 'Здравствуйте')))
    expect(fake.sent('copyMessage')).toHaveLength(0)
    expect(String(fake.sent('sendMessage')[0].params.text)).toContain('@ivan')
  })

  it('клиент заблокировал бота — менеджер узнаёт об этом', async () => {
    await connected()
    fake.failures.push((c) => (c.method === 'copyMessage' && c.params.chat_id === CLIENT ? new TelegramError('copyMessage', 403, 'Forbidden: bot was blocked by the user') : null))
    await handleUpdate(deps, upd(fromManager(100, 'Алло')))
    expect(String(fake.sent('sendMessage')[0].params.text)).toContain('заблокировал')
  })

  it('/close закрывает тему, следующее сообщение клиента открывает новую', async () => {
    await connected()
    await handleUpdate(deps, upd(fromManager(100, '/close')))
    expect(fake.sent('closeForumTopic')).toHaveLength(1)
    expect(deps.store.openThreadByClient(CLIENT)).toBeUndefined()
    fake.calls.length = 0
    await handleUpdate(deps, upd(fromClient('Ещё вопрос')))
    expect(fake.sent('createForumTopic')).toHaveLength(1)
    expect(fake.sent('copyMessage')[0].params.message_thread_id).toBe(101)
  })

  it('клиент без заявки пишет боту — создаётся новая тема и приходит подтверждение', async () => {
    await handleUpdate(deps, upd(fromClient('Здравствуйте, хочу сайт')))
    expect(fake.sent('createForumTopic')[0].params.name).toContain('Иван')
    expect(fake.sent('copyMessage')).toHaveLength(1)
    expect(fake.sent('sendMessage').some((c) => c.params.chat_id === CLIENT)).toBe(true)
  })

  it('удалённую вручную тему пересоздаёт и доставляет сообщение', async () => {
    await connected()
    let failed = false
    fake.failures.push((c) => {
      if (c.method === 'copyMessage' && c.params.message_thread_id === 100 && !failed) {
        failed = true
        return new TelegramError('copyMessage', 400, 'Bad Request: message thread not found')
      }
      return null
    })
    await handleUpdate(deps, upd(fromClient('Есть кто?')))
    expect(fake.sent('createForumTopic')).toHaveLength(1)
    expect(fake.sent('copyMessage')[0].params.message_thread_id).toBe(101)
  })
})

describe('что игнорируется', () => {
  it('«Общая» тема, сообщения ботов, служебные события и чужие группы', async () => {
    const { botLink } = await submitLead(deps, { name: 'Иван', contact: '@ivan', project: 'studio', message: '' })
    await handleUpdate(deps, upd(fromClient(`/start ${botLink.split('start=')[1]}`)))
    fake.calls.length = 0
    await handleUpdate(deps, upd(fromManager(undefined, 'болтовня менеджеров')))
    await handleUpdate(deps, upd(fromManager(100, 'бот', { from: { id: 9, is_bot: true } })))
    await handleUpdate(deps, upd(fromManager(100, '', { forum_topic_edited: {} })))
    await handleUpdate(deps, upd(fromManager(100, '/info')))
    await handleUpdate(deps, upd(msg({ chat: { id: -999, type: 'supergroup' }, message_thread_id: 100, text: 'чужая группа' })))
    expect(fake.calls).toHaveLength(0)
  })
})
