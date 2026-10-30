// Дымовая проверка собранного сайта: `pnpm build && pnpm start -p 3111`, затем `pnpm smoke`.
// Ловит то, что не видят typecheck/lint: падение страницы на мобильных/десктопе, ошибки в консоли, битые клики.
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL ?? 'http://localhost:3111'
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
let failed = 0
const check = (ok, msg) => {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${msg}`)
  if (!ok) failed++
}

for (const [name, opts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['tablet', { viewport: { width: 820, height: 1100 }, isMobile: true, hasTouch: true }],
  ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
]) {
  const page = await browser.newPage(opts)
  const errors = []
  const external = new Set()
  const origin = new URL(BASE).origin
  page.on('request', (r) => {
    const u = r.url()
    if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) external.add(new URL(u).host)
  })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE)
  await page.waitForTimeout(5000)
  const ids = await page.evaluate(() => ['hero', 'services', 'pricing', 'contact'].filter((id) => document.getElementById(id)))
  check(ids.length === 4, `${name}: страница отрисовалась (нет __next_error__)`)
  check(errors.length === 0, `${name}: нет ошибок в консоли ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`)
  check(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `${name}: нет горизонтальной прокрутки`)
  check(external.size === 0, `${name}: до согласия нет запросов к сторонним хостам ${external.size ? JSON.stringify([...external]) : ''}`)
  if (name === 'desktop') {
    await page.waitForTimeout(3000)
    await page.click('a:has-text("Обсудить проект")')
    await page.waitForTimeout(2500)
    check(await page.evaluate(() => scrollY > 2000), 'desktop: кнопка «Обсудить проект» ведёт к форме (клики не перехвачены канвасом)')
  }
  if (name === 'mobile') {
    await page.click('button:has-text("Только необходимые")').catch(() => {})
    await page.click('button[aria-label="Меню"]')
    await page.waitForTimeout(1200)
    check(await page.locator('#mobile-menu').isVisible(), 'mobile: меню открывается')
    await page.click('#mobile-menu a:has-text("Тарифы")')
    await page.waitForTimeout(2500)
    check(!(await page.locator('#mobile-menu').count()) && (await page.evaluate(() => scrollY > 1000)), 'mobile: пункт меню закрывает его и прокручивает к секции')
  }
  await page.close()
}
{
  // демо «сайт → Telegram → CRM»: заявка с макета сайта появляется в чате и в CRM, переносится по этапам, дашборд пересчитывается
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errs = []
  d.on('pageerror', (e) => errs.push(e.message))
  await d.goto(BASE)
  await d.waitForTimeout(3000)
  await d.evaluate(() => document.getElementById('demo').scrollIntoView())
  await d.waitForTimeout(1500)
  const tab = (name) => d.locator('#demo [role=tablist][aria-label="Что показать"] button', { hasText: name })
  await d.click('#demo nav button:has-text("Запись")')
  await d.fill('#demo input[placeholder="Имя"]', 'Проверка')
  await d.fill('#demo input[placeholder="Телефон или Telegram"]', '@check')
  await d.click('#demo form button:not([type=button])')
  await tab('Telegram').click()
  await d.waitForTimeout(900)
  check((await d.locator('#demo button:has-text("Взять в работу")').count()) >= 1, 'демо: заявка пришла в чат менеджера')
  await d.locator('#demo button:has-text("Взять в работу")').last().click()
  await tab('CRM').click()
  await d.waitForTimeout(1200)
  const card = d.locator('#demo li button', { hasText: 'Проверка' })
  check((await card.count()) === 1, 'демо: заявка появилась в CRM')
  await card.click()
  await d.waitForTimeout(600)
  check((await d.locator('#demo aside[aria-label^="Сделка"]').count()) === 1, 'демо: карточка сделки открывается')
  await d.click('#demo aside[aria-label^="Сделка"] button[aria-label="Закрыть"]')
  await d.waitForTimeout(500)
  await d.click('#demo aside button:has-text("Дашборд")')
  await d.waitForTimeout(1500)
  check(/ЗАЯВОК\s*6/i.test(await d.locator('#demo dl').innerText()), 'демо: дашборд пересчитал заявки')
  check(errs.length === 0, 'демо: без ошибок в консоли')
  await d.close()
}
{
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  for (const path of ['/motion', '/privacy', '/consent', '/cookies', '/work/keystone']) {
    await m.goto(BASE + path)
    await m.waitForTimeout(1500)
    check(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `mobile ${path}: нет горизонтальной прокрутки`)
  }
}
for (const path of ['/motion', '/privacy', '/consent', '/cookies', '/offer', '/work/pk-strela', '/work/keystone', '/opengraph-image', '/sitemap.xml', '/robots.txt']) {
  const r = await (await browser.newPage()).goto(BASE + path)
  check(r.status() === 200, `${path}: 200`)
}
{
  const r = await (await browser.newPage()).goto(BASE)
  check(r.headers()['x-content-type-options'] === 'nosniff' && r.headers()['x-frame-options'] === 'DENY', 'заголовки безопасности выставлены')
}
{
  const r = await (await browser.newPage()).goto(BASE + '/no-such-page')
  check(r.status() === 404, '/no-such-page: 404')
}
await browser.close()
process.exit(failed ? 1 : 0)
