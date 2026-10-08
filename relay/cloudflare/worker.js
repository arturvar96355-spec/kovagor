// Ретранслятор Telegram на Cloudflare Workers (бесплатно, без своего сервера). Делает то же, что relay/Caddyfile:
//   сайт ──(/bot…)──> Worker ──> api.telegram.org
//   Telegram ──(/hook)──> Worker ──> сайт (/api/telegram)
// Переменные (Settings → Variables): SITE_SERVER_IP, SITE_DOMAIN (обычные) и WEBHOOK_SECRET (тип Secret).

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // 1) Вызовы Bot API: только с IP российского сервера, чужим ретранслятор не нужен
    if (url.pathname.startsWith('/bot')) {
      if (request.headers.get('CF-Connecting-IP') !== env.SITE_SERVER_IP) return new Response('forbidden', { status: 403 })
      const target = new URL(url.pathname + url.search, 'https://api.telegram.org')
      return fetch(new Request(target, request))
    }

    // 2) Вебхук Telegram → сайт: только с верным секретным заголовком
    if (url.pathname === '/hook' && request.method === 'POST') {
      if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 })
      const target = new URL('/api/telegram', `https://${env.SITE_DOMAIN}`)
      return fetch(new Request(target, request))
    }

    return new Response('ok')
  },
}
