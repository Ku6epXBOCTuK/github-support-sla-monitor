# План: SLA Dashboard для кейса #4549142

## Описание для человека (что увидишь на странице)

**Общий вид:**
Страница выглядит как настоящий мониторинговый дашборд в стиле Grafana — тёмная тема, сетка панелей с тонкими рамками, данные обновляются в реальном времени. Всё на одном экране, без скролла на десктопе (на мобиле — вертикальная раскладка).

**Шапка (top bar):**

- Слева: название дашборда + номер тикета (`SLA MONITOR / #4549142`)
- Справа: текущее время (тикающие часы), статус-индикатор (зелёный/жёлтый/красный — зависит от времени ожидания)
- Навигация: ссылка «← BACK TO TIMER» на главную

**Ряд ключевых метрик (4 big number панели):**

1. **TIME ELAPSED** — сколько дней/часов/минут прошло (то же, что флип-часы, но в цифровом виде)
2. **LAST ACTIVITY** — сколько дней/часов назад было последнее событие
3. **SLA STATUS** — `BREACHED` (красный), так как SLA давно нарушен
4. **COMMENTS** — количество комментариев

**Центральная область — основной график:**

- Линейный график `ACTIVITY TIMELINE` — по оси X время (дни с момента создания), по оси Y — количество событий (комментарии, изменения лейблов, упоминания). Визуально — горизонтальная полоса с «вспышками» активности.

**Нижняя часть — 3 панели в ряд:**

1. **COMMENTS LOG** — список последних комментариев (автор, текст, дата), стилизованный как терминал/лог
2. **STATUS TIMELINE** — вертикальная лента событий: создание → лейблы → комментарии → текущий статус
3. **CASE DETAILS** — таблица-карточка: автор, assignee, labels, created, updated, milestone

**Футер:**

- `DATA SOURCE: GITHUB API | LAST UPDATED: <timestamp> | AUTO-REFRESH: 60s`
- Ссылка на сам тикет (откроется в новой вкладке)

**Поведение:**

- Все данные подгружаются из GitHub API (fetch на клиенте при загрузке)
- График обновляется раз в 60 секунд
- Анимация появления панелей (fade-in)
- На мобиле — панели стоят друг под другом

---

## Промпт для AI-генерации страницы

### SYSTEM / CONTEXT

Ты — фронтенд-разработчик. У тебя есть Astro-проект (v7, статичный сайт) с одной страницей — флип-часы. Стек: Astro + vanilla CSS + vanilla TypeScript. Никаких фреймворков (React/Vue/Svelte), никаких CSS-фреймворков (Tailwind). Единственный npm-пакет — astro. Шрифты подключены через Google Fonts `<link>`: Inter, Cormorant Garamond, IBM Plex Mono.

Тема проекта (design tokens в `global.css`):

```css
--background: #090a0a;
--foreground: #e9e4d9;
--gold: #b99a62;
--font-inter: "Inter", sans-serif;
--font-cormorant: "Cormorant Garamond", Georgia, serif;
--font-mono-local: "IBM Plex Mono", monospace;
```

### ЗАДАЧА

Создай новую страницу `src/pages/dashboard.astro` — «панель мониторинга SLA» для одного GitHub-тикета. Страница должна выглядеть как реалистичный Grafana/Monitoring дашборд (dark theme, grid панелей, данные в реальном времени).

### ТРЕБОВАНИЯ К ВИЗУАЛУ

1. **Общая стилистика:** Тёмная тема (#090a0a фон), панели с тонкими рамками (1px, rgba(255,255,255,0.06)), скругление 4px. Цвета акцентов: gold (#b99a62) для положительных значений, красный (#e74c3c) для BREACHED/критических, оранжовый (#f39c12) для предупреждений, зелёный (#2ecc71) для OK. Шрифт данных — IBM Plex Mono, заголовки панелей — Inter caps 9-10px с letter-spacing 0.16em (как микро-лейблы на существующей странице).

2. **Layout:** CSS Grid, основная раскладка — `grid-template-areas`:
   - Top bar (1 строка)
   - Metrics row (4 колонки: 4 big number панели)
   - Main chart (1 панель на всю ширину)
   - Bottom row (3 колонки: Comments, Status Timeline, Case Details)
   - На мобиле (max-width: 768px) — всё в одну колонку

3. **Навигация:** Header содержит ссылку `← BACK TO TIMER` (ссылается на `BASE_URL`), номер тикета, и живые часы (текущее время, обновляется каждую секунду через JS).

4. **Панели:**

   a) **Big Number Panels (4 штуки):**
   - Каждая: верхний лейбл (mono 9px caps), главное число (IBM Plex Mono 32-40px, жирный), подпись (mono 9px, muted)
   - `TIME ELAPSED` — XXd XXh XXm (рассчитывается из даты создания тикета)
   - `LAST ACTIVITY` — сколько дней/часов назад было последнее событие
   - `SLA STATUS` — `BREACHED` (красный) с мигающим индикатором (CSS анимация)
   - `COMMENTS` — количество комментариев

   b) **Activity Timeline Chart:**
   - Используй **Chart.js** (подключи через CDN `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`)
   - Line chart, dataset: дни по оси X (от 1 до N), количество событий по Y
   - Стиль: тонкая линия gold, area fill с gradient (gold → transparent), без grid lines на фоне, axis labels в mono 9px
   - Заголовок панели: `ACTIVITY TIMELINE` (mono 9px caps, letter-spacing 0.16em, muted)

   c) **Comments Log:**
   - Стилизован под терминал/лог: моноширинный шрифт, фон #0d0e0e, зелёный текст (#2ecc71) для автора, gold для даты, #e9e4d9 для тела комментария
   - Каждая строка: `[DD.MM.YYYY HH:MM] AUTHOR: comment text (обрезанный до 2 строк, с "..." )`
   - Скролл контейнер с фиксированной высотой (300px)
   - Заголовок: `COMMENTS LOG`

   d) **Status Timeline:**
   - Вертикальная лента: кружки-маркеры (gold) с линией-стержнем между ними
   - Каждое событие: дата + описание (e.g., "Issue opened", "Label: bug added", "Comment by user")
   - Последний маркер — красный, мигающий (текущий статус — без ответа)
   - Скролл контейнер
   - Заголовок: `STATUS TIMELINE`

   e) **Case Details:**
   - Таблица: `KEY | VALUE` в двух колонках
   - Строки: Created, Updated, Author, Assignee, Labels, Milestone, Repository
   - Значения в mono, ключи в muted caps
   - Заголовок: `CASE DETAILS`

5. **Футер:** `DATA SOURCE: GITHUB API | LAST UPDATED: <timestamp> | AUTO-REFRESH: 60s` — mono 9px, muted, по центру

### ДАННЫЕ

- Номер тикета: `4549142`
- Owner/reko: `OWNER/REPO` (placeholder — заменить на реальный)
- GitHub API endpoint: `https://api.github.com/repos/{owner}/{repo}/issues/{number}` и `/issues/{number}/comments`
- Все данные загружаются client-side через `fetch` в `<script>`
- Первая загрузка при открытии страницы + обновление раз в 60 секунд
- Пока данные грузятся — показывай скелетоны/плейсхолдеры (серые пульсирующие блоки, CSS animation)

### ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

1. `src/pages/dashboard.astro` — новая страница (основной файл, HTML + CSS + JS)
2. `src/pages/index.astro` — добавить ссылку `DASHBOARD →` в хедер
3. `src/styles/global.css` — не трогать (все стили dashboard в `<style>` теге страницы)

### ВАЖНО

- Не устанавливай npm-пакеты. Chart.js — через CDN.
- Сохрани design tokens проекта (цвета, шрифты)
- CSS должен быть в `<style>` теге страницы (Astro-способ), не в global.css
- Страница должна graceful degradation: если JS отключён, показать заголовок и статичные данные
- Не используй эмодзи
- Код должен быть чистым, без комментариев
