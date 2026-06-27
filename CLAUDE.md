# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server at http://localhost:5173/test/
npm run build      # Production build to dist/
npm run preview    # Preview built bundle
npm run deploy     # Build + publish dist/ to GitHub Pages via gh-pages
```

There is no test runner, linter, or formatter configured.

The Vite `base` is `/test/` (matches the GitHub Pages repo name). Don't change it without updating the deploy target.

Default PIN is `1234`. PIN is stored in plain text in `localStorage` — it's a casual guard, not real security.

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
| `taskflow_data_v3` | `tasks` + `categories` |
| `taskflow_settings` | theme, layout, card style, progress display, PIN toggle, reminder settings |
| `taskflow_pin` | PIN code |

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

### State (`src/stores/taskStore.js`)

Single Pinia store. Key getters: `filteredTasks` (applies `activeNav` + `filters.{search,cat,cycle,priority}` + sorting by overdue/done/priority), `stats`, `navBadges`, `categoryBadges`. Key actions: `syncFromRoute(route)` maps URL to `activeNav`, `toggleComplete`, `updateProgress`, `advanceDeadline` (cycle task push), `addCategory`/`deleteCategory`. Date helpers (`isToday`, `isThisWeek`, `isOverdue`, `formatDeadline`, `getPriorityLabel`, `getPriorityTagClass`) are exported from this file — reuse them instead of duplicating.

`loadFromStorage()` is called from `App.vue` `onMounted`; `scheduleReminders` re-runs on `watch` of tasks/notification settings. First-time load auto-injects 8 demo tasks.

### Composables

- `useDevice.js` — singleton reactive device flags. Import and call `useDevice()` anywhere.
- `useReminders.js` — `scheduleReminders(tasks, settings)` clears and rebuilds `setTimeout` chain for in-window reminders (24h cap). Driven by `task.reminder` and `task.deadline - settings.remindAhead`.
- `useToast.js` — `toastService.showToast(text, type)`. Used by reminders, store mutations, etc.
- `useCountdown.js` — reactive countdown text/class for a deadline ref.

### Styles

Plain CSS, no preprocessor. Imported in this order in `main.js`: `variables.css` (color tokens / shadows), `base.css` (reset + `.app-wrapper`), `components.css` (all desktop component styles, ~600 lines), then `mobile.css` (must come last — contains tablet overrides and mobile-only `.m-*` classes plus `@media (hover: none)` rules that neutralize desktop hover states on touch).

When adding a new visual element, prefer extending `components.css` and reusing `--accent`, `--bg-*`, `--text-*`, `--border-color`, `--shadow*`, `--radius`, `--transition` from `variables.css`.

### External integration

Icons use `lucide-vue-next`. All form elements, buttons, dialogs, sheets are native HTML + custom CSS — no UI component library. Inter font is loaded from Google Fonts in `index.html`.

### Recurring tasks

When a task with `cycle !== 'none'` is marked complete (via `toggleComplete` or `updateProgress(val=100)`), the store calls `advanceDeadline(dl, cycle)` to push `deadline` and `reminder` forward by one cycle (daily +1d / weekly +7d / monthly +1mo, preserving hour/minute), resets `progress` to 0, and the task is NOT marked done. Implemented in `src/stores/taskStore.js`.

### Search debouncing

Both `Toolbar.vue` and `mobile/MobileToolbar.vue` use `useDebouncedRef(initial, 250)` from `src/composables/useDebouncedRef.js` to batch keystrokes before calling `store.setFilter('search', ...)`.
