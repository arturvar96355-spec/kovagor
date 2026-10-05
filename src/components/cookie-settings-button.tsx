'use client'

import { COOKIE_SETTINGS_EVENT } from '@/lib/analytics'

/** Возврат к выбору по cookie: показывает баннер снова (отозвать согласие можно в любой момент). */
export function CookieSettingsButton() {
  return (
    <button onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))} className="hover:underline">
      Настройки cookie
    </button>
  )
}
