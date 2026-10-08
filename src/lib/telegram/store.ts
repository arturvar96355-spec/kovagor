import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type Lead = { id: number; name: string; contact: string; project: string; message: string; quiz: string; created_at: number }
/** Тред = тема в группе менеджеров ↔ один клиент. client_chat_id пуст, пока клиент не открыл бота. */
export type Thread = {
  topic_id: number
  client_chat_id: number | null
  lead_id: number | null
  client_name: string
  closed: number
  created_at: number
}

/** Хранилище на SQLite (встроенный node:sqlite, без нативных зависимостей). Файл должен лежать на постоянном диске. */
export class Store {
  private db: DatabaseSync

  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
    this.db = new DatabaseSync(path)
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, contact TEXT NOT NULL, project TEXT NOT NULL, message TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS threads (
        topic_id INTEGER PRIMARY KEY,
        client_chat_id INTEGER,
        lead_id INTEGER,
        client_name TEXT NOT NULL DEFAULT '',
        closed INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      -- согласие клиента на обработку данных в Telegram-переписке (дата, чат)
      CREATE TABLE IF NOT EXISTS tg_consents (chat_id INTEGER PRIMARY KEY, consented_at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS threads_client ON threads(client_chat_id, closed);
      -- журнал согласий на обработку ПД (152-ФЗ): хранить не менее 3 лет
      CREATE TABLE IF NOT EXISTS consents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, contact TEXT NOT NULL,
        policy_version TEXT NOT NULL, ip_hash TEXT NOT NULL,
        consented_at INTEGER NOT NULL
      );
    `)
    try {
      this.db.exec("ALTER TABLE leads ADD COLUMN quiz TEXT NOT NULL DEFAULT ''")
    } catch {
      // колонка уже есть
    }
  }

  hasTgConsent(chatId: number): boolean {
    return !!this.db.prepare('SELECT 1 FROM tg_consents WHERE chat_id = ?').get(chatId)
  }

  setTgConsent(chatId: number): void {
    this.db.prepare('INSERT OR IGNORE INTO tg_consents(chat_id, consented_at) VALUES (?,?)').run(chatId, Date.now())
  }

  logConsent(c: { name: string; contact: string; policy_version: string; ip_hash: string }): void {
    this.db
      .prepare('INSERT INTO consents(name, contact, policy_version, ip_hash, consented_at) VALUES (?,?,?,?,?)')
      .run(c.name, c.contact, c.policy_version, c.ip_hash, Date.now())
  }

  listConsents(): { name: string; contact: string; policy_version: string; ip_hash: string; consented_at: number }[] {
    return this.db.prepare('SELECT name, contact, policy_version, ip_hash, consented_at FROM consents ORDER BY id').all() as never
  }

  createLead(l: Omit<Lead, 'id' | 'created_at' | 'quiz'> & { quiz?: string }): Lead {
    const created_at = Date.now()
    const quiz = l.quiz ?? ''
    const r = this.db.prepare('INSERT INTO leads(name, contact, project, message, quiz, created_at) VALUES (?,?,?,?,?,?)').run(l.name, l.contact, l.project, l.message, quiz, created_at)
    return { ...l, quiz, id: Number(r.lastInsertRowid), created_at }
  }

  getLead(id: number): Lead | undefined {
    return this.db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as Lead | undefined
  }

  createThread(t: { topic_id: number; lead_id: number | null; client_chat_id: number | null; client_name: string }): void {
    this.db
      .prepare('INSERT OR REPLACE INTO threads(topic_id, client_chat_id, lead_id, client_name, closed, created_at) VALUES (?,?,?,?,0,?)')
      .run(t.topic_id, t.client_chat_id, t.lead_id, t.client_name, Date.now())
  }

  threadByTopic(topicId: number): Thread | undefined {
    return this.db.prepare('SELECT * FROM threads WHERE topic_id = ?').get(topicId) as Thread | undefined
  }

  /** Открытый тред клиента (последний). */
  openThreadByClient(chatId: number): Thread | undefined {
    return this.db.prepare('SELECT * FROM threads WHERE client_chat_id = ? AND closed = 0 ORDER BY created_at DESC LIMIT 1').get(chatId) as Thread | undefined
  }

  threadByLead(leadId: number): Thread | undefined {
    return this.db.prepare('SELECT * FROM threads WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1').get(leadId) as Thread | undefined
  }

  linkClient(topicId: number, chatId: number): void {
    this.db.prepare('UPDATE threads SET client_chat_id = ? WHERE topic_id = ?').run(chatId, topicId)
  }

  closeThread(topicId: number): void {
    this.db.prepare('UPDATE threads SET closed = 1 WHERE topic_id = ?').run(topicId)
  }
}
