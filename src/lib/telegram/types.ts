export type TgUser = { id: number; is_bot?: boolean; first_name?: string; last_name?: string; username?: string }
export type TgChat = { id: number; type: 'private' | 'group' | 'supergroup' | 'channel' }
export type TgMessage = {
  message_id: number
  message_thread_id?: number
  is_topic_message?: boolean
  from?: TgUser
  chat: TgChat
  text?: string
  via_bot?: TgUser
  forum_topic_created?: unknown
  forum_topic_closed?: unknown
  forum_topic_reopened?: unknown
  forum_topic_edited?: unknown
}
export type TgCallbackQuery = { id: string; from: TgUser; message?: TgMessage; data?: string }
export type TgUpdate = { update_id: number; message?: TgMessage; callback_query?: TgCallbackQuery }

export type BotConfig = {
  groupId: number // супергруппа менеджеров с включёнными темами
  botUsername: string // без @
  secret: string // для подписи deep-link
  siteUrl: string
}
