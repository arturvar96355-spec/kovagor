import { describe, expect, it } from 'vitest'
import { CONSENT_VERSION, POLICY_VERSION } from '@/content/legal'
import { hashIp, logConsent } from './consent-log'
import { Store } from './telegram/store'

describe('журнал согласий', () => {
  it('пишет факт согласия с версией политики и хэшем IP (без открытого IP)', () => {
    const store = new Store(':memory:')
    logConsent(store, { name: 'Иван', contact: '@ivan', ip: '203.0.113.7' })
    const [row] = store.listConsents()
    expect(row).toMatchObject({ name: 'Иван', contact: '@ivan', policy_version: expect.stringContaining(`consent:${CONSENT_VERSION}`) })
    expect(row.policy_version).toContain(`policy:${POLICY_VERSION}`)
    expect(row.ip_hash).toBe(hashIp('203.0.113.7'))
    expect(row.ip_hash).not.toContain('203.0.113.7')
    expect(row.consented_at).toBeGreaterThan(0)
  })

  it('не падает, если хранилища нет', () => {
    expect(() => logConsent(null, { name: 'a', contact: 'b', ip: 'c' })).not.toThrow()
  })
})
