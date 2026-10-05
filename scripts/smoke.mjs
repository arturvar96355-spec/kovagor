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
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE)
  await page.waitForTimeout(5000)
  const ids = await page.evaluate(() => ['hero', 'services', 'pricing', 'contact'].filter((id) => document.getElementById(id)))
  check(ids.length === 4, `${name}: страница отрисовалась (нет __next_error__)`)
  check(errors.length === 0, `${name}: нет ошибок в консоли ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`)
  check(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `${name}: нет горизонтальной прокрутки`)
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
for (const path of ['/privacy', '/cookies', '/offer', '/work/pk-strela', '/work/keystone', '/opengraph-image', '/sitemap.xml', '/robots.txt']) {
  const r = await (await browser.newPage()).goto(BASE + path)
  check(r.status() === 200, `${path}: 200`)
}
{
  const r = await (await browser.newPage()).goto(BASE + '/no-such-page')
  check(r.status() === 404, '/no-such-page: 404')
}
await browser.close()
process.exit(failed ? 1 : 0)
