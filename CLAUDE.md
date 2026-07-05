# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite + Express concurrently (Vite :5173, Express :3001)
npm run dev:vite     # Vite only
npm run dev:server   # Express only (with --watch)
npm run build        # Vite production build to dist/
npm start            # Express production mode (serves dist/ + API)
npm run preview      # Vite preview of built bundle
npm test             # Vitest unit tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E tests
```

There is no linter or formatter configured.

The Vite `base` defaults to `/` (for Render). For GitHub Pages, set `BASE_PATH=/test/` before building. Don't hardcode base — use the env var.

Default PIN is `1234`. PIN is stored in plain text in `localStorage` — it's a casual guard, not real security.

## Backend

An Express server (`server/index.js`) runs on port 3001 and provides:
- `POST /api/ai/parse-task` — natural language → structured task object (DeepSeek API)
- `POST /api/ai/breakdown` — goal → subtask list (DeepSeek API)
- `POST /api/ai/weekly-report` — task data → SSE-streamed Markdown report (DeepSeek API)
- Static file serving in production (serves `dist/`)

API key is stored server-side in `.env` as `DEEPSEEK_API_KEY`. Never expose it in frontend code. Copy `.env.example` to `.env` and fill in your key.

In dev mode, Vite proxies `/api/*` to Express. In production, Express serves both the API and static files.

## Architecture

TaskFlow Pro is a single-page Vue 3 + Pinia task manager with **Vue Router 4 Hash mode**. View state lives in `store.activeNav` (values: `all`, `today`, `week`, `overdue`, `done`, `p-<priority>`, `cat-<id>`), and components react to it. Route changes sync to `activeNav` via `store.syncFromRoute(route)`, not the other way around. Navigation clicks use `router.push()`.

### Router

7 routes defined in `src/router/index.js` using `createWebHashHistory()` (compatible with GitHub Pages static hosting):

| Route | activeNav |
|---|---|
| `/` | `all` |
| `/today` | `today` |
| `/week` | `week` |
| `/overdue` | `overdue` |
| `/done` | `done` |
| `/priority/:priority` | `p-<priority>` |
| `/category/:id` | `cat-<id>` |

`App.vue` watches `route.path` and calls `store.syncFromRoute(route)` to keep `activeNav` in sync. Task lists re-compute via the `filteredTasks` getter.

### localStorage keys

| Key | Stores |
|---|---|
| `taskflow_tasks` | tasks array |
| `taskflow_categories` | categories array |
| `taskflow_settings` | theme, layout, card style, progress display, PIN toggle, reminder settings |
| `taskflow_pin` | PIN code |

Legacy key `taskflow_data_v3` (stored `{tasks, categories}` together) is migrated on first load then deleted.

### Dual layout: desktop vs. mobile

`App.vue` switches between two render trees based on `useDevice().isMobile`:

- **Desktop tree** (≥1024px and tablet 768–1023px): `TopNav` + `Sidebar` + `ContentArea` inside `.app-wrapper` (1440px on desktop, full-width on tablet via `mobile.css`).
- **Mobile tree** (<768px): `src/components/mobile/MobileLayout.vue` containing `MobileTopNav` (hamburger), `MobileDrawer` (slide-in sidebar), `MobileStatsRow` (horizontal scroll), `MobileToolbar` + `MobileFilterSheet` (bottom sheet), and `MobileTaskGrid` (single-column).

Modals, `LockScreen`, `ContextMenu`, and `ToastContainer` are **always mounted** alongside (outside the conditional), so they're shared between both trees. `TaskCard` is also shared — it adds a 500ms `touchstart` long-press to trigger `ContextMenu` on touch devices.

Tablet uses the desktop tree but `src/style/mobile.css` adjusts it via `@media (min-width: 768px) and (max-width: 1023px)`: sidebar shrinks to 200px, task grid → 2 columns, stats row → 3 columns, form rows stack.

### Breakpoints

Defined in `src/composables/useDevice.js` (module-level singleton with `matchMedia` listeners):
- Mobile: `max-width: 767px`
- Tablet: `768px–1023px`
- Desktop: `≥1024px`

### State (Pinia stores)

6 independent stores under `src/stores/`:

| Store | File | Purpose | Persisted |
|-------|------|---------|-----------|
| `useTaskStore` | `taskStore.js` | tasks CRUD, `filteredTasks` getter, `stats`/`navBadges`/`alertTasks`, `filters`, `activeNav`, `syncFromRoute` | yes (`taskflow_tasks`) |
| `useCategoryStore` | `categoryStore.js` | categories CRUD, `categoryBadges` getter | yes (`taskflow_categories`) |
| `useSettingsStore` | `settingsStore.js` | theme, layout, cardStyle, progressDisplay, pinEnabled, notifEnabled, remindAhead | yes (`taskflow_settings`) |
| `useAuthStore` | `authStore.js` | `pin`, `isLocked`, `verifyPin`, `lockApp`, `changePin` | yes (`taskflow_pin`) |
| `useBatchStore` | `batchStore.js` | `selectedTasks[]`, `batchMode`, batch operations | no |
| `useContextMenuStore` | `contextMenuStore.js` | `contextTaskId`, `contextMenuPos`, `contextTask` getter | no |

**Cross-store dependencies** (all one-way, no cycles):
- `categoryStore` → `taskStore` (categoryBadges counts tasks per category, deleteCategory checks for tasks)
- `batchStore` → `taskStore` (batchSelectAll reads filteredTasks, batchMarkDone/batchDelete mutate tasks)
- `contextMenuStore` → `taskStore` (contextTask getter finds task by ID)
- `authStore` → `settingsStore` (loadFromStorage reads pinEnabled to set isLocked)

**Initialization order** in `App.vue` `onMounted` (matters because of the authStore→settingsStore dep):
1. `settingsStore.loadFromStorage()`
2. `authStore.loadFromStorage()`
3. `taskStore.loadFromStorage()`
4. `categoryStore.loadFromStorage()`

**Utility functions** are in `src/utils/helpers.js`: `isToday`, `isThisWeek`, `isThisMonth`, `isOverdue`, `formatDeadline`, `advanceDeadline`, `getPriorityLabel`, `getPriorityTagClass`, `genId`, `genCatId`. Import from `../utils/helpers.js` — do NOT duplicate these.

`loadFromStorage()` is called from `App.vue` `onMounted`; `scheduleReminders` re-runs on `watch` of tasks/notification settings. First-time load auto-injects 8 demo tasks and 5 default categories.

### Composables

- `useDevice.js` — singleton reactive device flags. Import and call `useDevice()` anywhere.
- `useReminders.js` — `scheduleReminders(tasks, settings)` clears and rebuilds `setTimeout` chain for in-window reminders (24h cap). Driven by `task.reminder` and `task.deadline - settings.remindAhead`.
- `useToast.js` — `toastService.showToast(text, type)`. Used by reminders, store mutations, etc.
- `useCountdown.js` — reactive countdown text/class for a deadline ref.
- `useDebouncedRef.js` — `useDebouncedRef(initial, 250)` returns `{local, debounced}` ref pair for search input.
- `useClaudeAI.js` — `parseNaturalLanguage(text)`, `breakdownGoal(goal, existingTasks)`, `streamWeeklyReport(tasks, stats, {onChunk, onDone, onError})`. Calls `/api/ai/*` endpoints. Stream handles reconnection (up to 2 retries).

### AI Features

Three AI-powered features backed by DeepSeek API:

1. **Natural Language Task Creation** — embedded in `TaskModal.vue` (new task mode only). User types a sentence → "AI 解析" button → form auto-fills. User can edit before saving.

2. **AI Task Breakdown** — `AITaskBreakdown.vue` modal. User enters a goal → AI returns 3-6 subtasks → user edits/selects → batch adds to store. Triggered from Toolbar (desktop) or MobileToolbar (mobile).

3. **AI Weekly Report** — `AIWeeklyReport.vue` modal. SSE streams a Markdown report from DeepSeek based on this week's task data. Typewriter effect with `marked` rendering. Copy button. Triggered from TopNav (desktop) or MobileTopNav (mobile).

### Testing

**Vitest** (`vitest.config.js`): Unit tests for utility functions (`src/utils/__tests__/helpers.test.js`, 27 tests) and store actions (`src/stores/__tests__/taskStore.test.js`). Run with `npm test`.

**Playwright** (`playwright.config.js`): E2E tests in `e2e/` for task CRUD, filters, AI parse UI. Run with `npm run test:e2e`. Uses Chromium headless.

### CI/CD

`.github/workflows/deploy.yml`: on push to main → `npm install` → `vitest run` → `vite build` (with `BASE_PATH=/test/`) → deploy to GitHub Pages via `actions/deploy-pages`.

Render auto-deploys from main branch: `npm install` → `npm run build` → `npm start`.

### Styles

Plain CSS, no preprocessor. Imported in this order in `main.js`: `variables.css` (color tokens / shadows), `base.css` (reset + `.app-wrapper`), `components.css` (all desktop component styles, ~600 lines), then `mobile.css` (must come last — contains tablet overrides and mobile-only `.m-*` classes plus `@media (hover: none)` rules that neutralize desktop hover states on touch).

When adding a new visual element, prefer extending `components.css` and reusing `--accent`, `--bg-*`, `--text-*`, `--border-color`, `--shadow*`, `--radius`, `--transition` from `variables.css`.

### External integration

Icons use `lucide-vue-next`. All form elements, buttons, dialogs, sheets are native HTML + custom CSS — no UI component library. Inter font is loaded from Google Fonts in `index.html`.

### Recurring tasks

When a task with `cycle !== 'none'` is marked complete (via `toggleComplete` or `updateProgress(val=100)`), the store calls `advanceDeadline(dl, cycle)` to push `deadline` and `reminder` forward by one cycle (daily +1d / weekly +7d / monthly +1mo, preserving hour/minute), resets `progress` to 0, and the task is NOT marked done. Implemented in `src/stores/taskStore.js`.

### Search debouncing

Both `Toolbar.vue` and `mobile/MobileToolbar.vue` use `useDebouncedRef(initial, 250)` from `src/composables/useDebouncedRef.js` to batch keystrokes before calling `store.setFilter('search', ...)`.
