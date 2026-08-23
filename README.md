# Waiting for GitHub Support — Elapsed Time

Флип-часы, которые считают, сколько времени прошло с момента открытия тикета в поддержке GitHub — без ответа, без прогресса, без SLA.

Проект показывает «SLA от GitHub» на основе реальных данных: стартовая точка зафиксирована как абсолютный момент времени (`2026-07-09T20:00:00+05:00` — тикет открыт 9 июля 2026, 20:00 по UTC+5), и счётчик честно тикает дальше каждую секунду.

Ответа всё нет. Часы работают.

## Что на странице

- Аналоговый флип-таймер в духе вокзальных табло: каждая цифра переворачивается отдельной створкой
- Тёмная «кейсовая» эстетика: CASE → GITHUB TICKET, статус `AWAITING RESPONSE`, подпись `SLA: NOT FOUND`
- Адаптив под мобильные, поддержка `prefers-reduced-motion`

## Стек

- [Astro](https://astro.build) — единственная зависимость
- Статичный HTML + обычный CSS + ~60 строк vanilla TS для флип-анимации
- Шрифты Inter / Cormorant Garamond / IBM Plex Mono через Google Fonts (`<link>`, без npm-пакетов)

## Запуск локально

```bash
npm install
npm run dev      # дев-сервер на http://localhost:4321
npm run build    # сборка статики в dist/
npm run preview  # предпросмотр собранного
```

## Деплой

Автоматический через Gitea Actions: пуш в `main` → раннер собирает проект и rsync'ает `dist/` в `/var/www/pages/<owner>/<repo>` (см. `.gitea/workflows/deploy.yaml`). Отдаётся nginx'ом как статика, HTTPS — certbot.

## Поменять под себя

Всё редактируется в одном файле — `src/pages/index.astro`:

- **Стартовая дата** — константа `START_DATE` и `START_TIME` (обязательно с офсетом таймзоны, например `+05:00`, иначе момент будет зависеть от часового пояса посетителя)
- **Номер тикета** — строка `GITHUB TICKET / #…` в шапке
- **Подписи** — `SLA: NOT FOUND`, `NO RESOLUTION YET`, тексты футера

---

_An exercise in patience. The clock keeps moving._
