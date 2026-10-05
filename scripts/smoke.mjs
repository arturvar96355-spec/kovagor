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
  // шторка: переход между страницами реально анимируется и в конце возвращается в исходное положение
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await d.goto(BASE + '/about')
  await d.waitForTimeout(2500)
  await d.evaluate(() => {
    const el = [...document.querySelectorAll('div[aria-hidden]')].find((e) => e.className.includes('z-[95]'))
    window.__curtain = []
    const t0 = performance.now()
    ;(function sample() {
      window.__curtain.push(new DOMMatrix(getComputedStyle(el).transform).m42)
      if (performance.now() - t0 < 3000) requestAnimationFrame(sample)
    })()
  })
  await d.click('a:has-text("Как мы работаем")')
  await d.waitForTimeout(3500)
  const vals = await d.evaluate(() => window.__curtain)
  check(Math.min(...vals) < 1700 && d.url().includes('#process'), 'шторка при переходе анимируется, переход состоялся')
  check(vals[vals.length - 1] >= 800, 'шторка вернулась в исходное положение')
}
{
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  for (const path of ['/about', '/motion', '/privacy', '/consent', '/cookies', '/work/keystone']) {
    await m.goto(BASE + path)
    await m.waitForTimeout(1500)
    check(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `mobile ${path}: нет горизонтальной прокрутки`)
  }
}
for (const path of ['/about', '/motion', '/privacy', '/consent', '/cookies', '/offer', '/work/pk-strela', '/work/keystone', '/opengraph-image', '/sitemap.xml', '/robots.txt']) {
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
