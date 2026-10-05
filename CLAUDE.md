@AGENTS.md

# KOVAGOR — сайт студии (эталонный сайт и витрина анимаций)

## Стек
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · GSAP (+ScrollTrigger, SplitText) · Lenis · Motion (`motion/react`) · React Three Fiber/drei · react-hook-form + zod · SQLite (`node:sqlite`) · Vitest · pnpm.
Перед правками Next.js читайте `node_modules/next/dist/docs/` (в этой версии `params` — Promise, `middleware` → `proxy`).

## Команды
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm test` (vitest) · `pnpm smoke` (нужен `pnpm start -p 3111`: desktop/tablet/mobile).

## Структура
- `src/app` — страницы, `api/lead` (приём заявок), `api/telegram` (вебхук бота), OG/иконки.
- `src/components/motion` — анимационные примитивы (SplitReveal, Reveal, Magnetic, TiltCard, Marquee, Cursor, Preloader, SmoothScroll, SectionHead).
- `src/components/three` — единая WebGL-сцена: `poses.ts` (поза монограммы по секциям), `bind-poses.ts` (ScrollTrigger), `monogram-scene.tsx`.
- `src/components/sections` — секции главной; `src/content` — весь текст/данные (тарифы, FAQ, проекты, процесс).
- `src/lib/telegram` — бот (заявки → темы группы, переписка менеджер ↔ клиент), `leads-delivery.ts` (Telegram + email параллельно), `consent-log.ts` (журнал согласий 152-ФЗ).
- `docs/` — ANALYSIS (анализ пакета), CLIENT_PLAYBOOK, LEGAL_CHECKLIST, TELEGRAM, DEPLOY.

## Правила анимаций (обязательные)
1. **GSAP — скролл-сцены и тексты, Motion — интерфейс и переходы**; не смешивать на одном элементе.
2. Анимируем только `transform`/`opacity` (и `clip-path`, `filter` точечно). Никаких анимаций `width/height/top/left`.
3. `prefers-reduced-motion`: каждая анимация внутри `gsap.matchMedia()` с условием `NO_REDUCED_MOTION` (из `lib/animation.ts`); при reduced-motion содержимое просто видно.
4. Всё, что зависит от размеров или `getTotalLength()`, — внутри соответствующего `matchMedia` (у скрытых SVG `getTotalLength()` бросает исключение и роняет страницу).
5. Строковые селекторы GSAP в отложенных колбэках теряют scope: берите элементы заранее (`gsap.utils.toArray(sel, root)`).
6. Любое вступление hero ждёт заставку: `afterPreload()`; WebGL-сцена — только десктоп с WebGL (`three/capability.ts`), канвас с `pointer-events: none`.
7. Единые easing/длительности — `lib/animation.ts`.
8. Канвас на весь экран не должен перехватывать клики (проверяет `pnpm smoke`).

## Контент и честность
- Нет выдуманных фактов, цифр, отзывов, клиентов. Неизвестное — `TODO(content)`; юридическое — `TODO(legal)` (`grep -rn "TODO(" src`).
- Тон: прямой, без «комплексный/инновационный/уникальный/современный подход/высококачественный».
- Кейсы с реальными названиями публикуются только с согласием клиента.
- Цены — только «от» (5 000 / 15 000 / 30 000 ₽); состав тарифов — черновик до утверждения.

## Перед коммитом
`pnpm typecheck && pnpm lint && pnpm test`, для изменений интерфейса — `pnpm build && pnpm start -p 3111` и `pnpm smoke`, мобильная ширина 390 px обязательно.
