# TaskFlow Pro

一个基于 Vue 3 + Pinia 的单页待办事项管理系统，支持 PC、平板、手机三端响应式适配，数据本地持久化，离线可用。零运行时依赖 UI 框架，原生 CSS 编写，生产构建 CSS 仅 25 KB（gzip 5 KB）。

## 最近更新

- **CSS 体积减少 93%**：移除未使用的 Element Plus，CSS 从 385 KB 降到 25 KB
- **循环任务真正工作**：每日 / 每周 / 每月任务勾选完成后会自动推进到下一周期，而非永久标记为已完成
- **搜索框防抖**：250ms 防抖，避免大量任务时每次按键都触发筛选
- **localStorage 错误可见**：保存或读取失败时弹出 Toast 提示，不再静默吞掉
- **移动抽屉清理**：跨断点切换设备时不会再因为抽屉残留导致 body 锁滚动

## 功能亮点

- **任务管理**：新建 / 编辑 / 删除 / 批量操作 / 进度跟踪
- **循环任务**：每日 / 每周 / 每月任务勾选完成后自动推进 deadline 与 reminder 到下一周期
- **多维筛选**：按视图（全部 / 今日 / 本周 / 已逾期 / 已完成）、优先级、类别、关键词筛选；搜索带防抖
- **截止提醒**：指定提醒时间或截止前 N 分钟自动 Toast 提醒（24h 内排定 setTimeout）
- **数据安全**：可选 PIN 码锁屏，所有数据存于 `localStorage`，不上传任何服务器
- **响应式适配**：
  - 桌面端（≥1024px）：三列任务网格 + 侧栏导航
  - 平板（768–1023px）：两列任务网格 + 窄侧栏
  - 手机（<768px）：单列任务列表 + 汉堡抽屉导航 + 底部筛选 sheet，长按卡片触发上下文菜单
- **统计概览**：总任务、进行中、已完成、已逾期、完成率、本周完成率
- **本地持久化**：任务、类别、设置、PIN 自动保存到 `localStorage`，首次访问注入演示数据

## 技术栈

| 类型 | 选型 |
|---|---|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 状态管理 | Pinia 2 |
| 构建工具 | Vite 5 |
| 图标 | lucide-vue-next |
| 样式 | 原生 CSS + CSS 变量（无预处理器） |
| 字体 | Inter（Google Fonts） |
| 部署 | gh-pages → GitHub Pages |

> **零 UI 框架**：所有交互组件（弹窗、按钮、表单、抽屉、底部 sheet）均为原生 HTML + 自定义 CSS，不依赖 Element Plus / Ant Design 等组件库。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173/test/）
npm run dev

# 生产构建（产物在 dist/）
npm run build

# 预览生产包
npm run preview

# 部署到 GitHub Pages
npm run deploy
```

> **注意**：`vite.config.js` 中 `base: "/test/"` 是为 GitHub Pages 仓库路径配置的。若修改仓库名或独立部署，请同步调整该值。

## 构建产物

```
dist/index.html           0.67 kB │ gzip: 0.42 kB
dist/assets/index-*.css  25.68 kB │ gzip: 5.10 kB
dist/assets/index-*.js  158.19 kB │ gzip: 53.03 kB
```

## 项目结构

```
taskflow/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js                       # 入口：注册 Pinia、按顺序引入样式
    ├── App.vue                       # 根组件，按 isMobile 切换两套布局树
    ├── components/
    │   ├── TopNav.vue                # 桌面顶栏
    │   ├── Sidebar.vue               # 桌面侧栏（260px）
    │   ├── ContentArea.vue           # 桌面内容区
    │   ├── TaskGrid.vue              # 三列任务网格
    │   ├── TaskCard.vue              # 任务卡片（含长按 → 上下文菜单）
    │   ├── Toolbar.vue               # 搜索（防抖）+ 筛选 + 视图切换
    │   ├── StatsRow.vue              # 五列统计卡
    │   ├── BatchBar.vue              # 批量操作栏
    │   ├── AlertBanner.vue           # 逾期/紧急提示横幅
    │   ├── ContextMenu.vue           # 右键 / 长按菜单
    │   ├── LockScreen.vue            # PIN 锁屏
    │   ├── ToastContainer.vue        # Toast 容器
    │   ├── mobile/                   # 手机端独立组件
    │   │   ├── MobileLayout.vue
    │   │   ├── MobileTopNav.vue
    │   │   ├── MobileDrawer.vue      # 滑出式侧栏（含卸载清理）
    │   │   ├── MobileStatsRow.vue    # 横向滚动统计
    │   │   ├── MobileToolbar.vue     # 搜索（防抖）+ 筛选按钮
    │   │   ├── MobileFilterSheet.vue # 底部上滑筛选
    │   │   └── MobileTaskGrid.vue    # 单列任务列表
    │   └── modals/
    │       ├── TaskModal.vue         # 新建 / 编辑任务
    │       ├── SettingsModal.vue     # 设置面板
    │       ├── ProgressModal.vue     # 进度调整
    │       └── PinChangeModal.vue    # 修改 PIN
    ├── composables/
    │   ├── useDevice.js              # matchMedia 设备检测（单例）
    │   ├── useReminders.js           # 截止提醒定时器
    │   ├── useToast.js               # Toast 服务
    │   ├── useCountdown.js           # 截止倒计时
    │   └── useDebouncedRef.js        # 通用防抖 ref 工厂
    ├── stores/
    │   └── taskStore.js              # Pinia store（任务 / 分类 / 设置 / 筛选 / 循环推进）
    └── style/
        ├── variables.css             # 颜色、阴影、圆角、过渡变量
        ├── base.css                  # 重置 + .app-wrapper
        ├── components.css            # 桌面组件样式
        └── mobile.css                # 平板覆写 + 手机独立样式（必须最后引入）
```

## 架构说明

### 无路由设计

整个应用没有使用 vue-router，**视图状态由 `store.activeNav` 驱动**，取值如：
- `all` / `today` / `week` / `overdue` / `done`
- `p-<priority>`（如 `p-critical`）
- `cat-<id>`（如 `cat-work`）

组件通过 `store.filteredTasks` getter 自动响应 nav 切换 + 筛选条件 + 排序（逾期优先 → 未完成优先 → 优先级排序）。

### 双布局树

`App.vue` 根据 `useDevice().isMobile` 渲染：

| 设备 | 渲染树 |
|---|---|
| 桌面 / 平板（≥768px） | `TopNav` + `Sidebar` + `ContentArea` |
| 手机（<768px） | `MobileLayout`（独立组件） |

模态框、锁屏、上下文菜单、Toast 容器**始终挂载**在两套树之外，两端共用。`TaskCard` 也由两端共享，自带 500ms `touchstart` 长按计时器触发上下文菜单。

平板沿用桌面树，仅通过 `mobile.css` 的 `@media (min-width: 768px) and (max-width: 1023px)` 调整列数和尺寸。

### 循环任务推进机制

`taskStore.toggleComplete()` 与 `updateProgress(val=100)` 在检测到 `task.cycle !== 'none'` 时，调用 `advanceDeadline(dl, cycle)` 把 `deadline` 与 `reminder` 推进一个周期（daily +1d / weekly +7d / monthly +1mo，保留时分），并把 `progress` 重置为 0。任务不会被永久标记为已完成，下一周期到达后会重新出现在「今日」「本周」「逾期」视图中。

### 数据存储

三个 `localStorage` 键：

| Key | 存储内容 |
|---|---|
| `taskflow_data_v3` | `tasks` + `categories` |
| `taskflow_settings` | 主题、布局、卡片样式、进度显示、PIN 开关、提醒设置 |
| `taskflow_pin` | PIN 码 |

读写失败时通过 Toast 显式提示用户（例如配额超限或隐私模式禁用 storage）。首次访问且无数据时，store 会自动注入 8 条演示任务。

### 截止提醒

`scheduleReminders(tasks, settings)` 在 `App.vue` 挂载和任务变更时重建定时器链。仅排入 24 小时内即将到达的任务（`task.reminder` 或 `task.deadline - settings.remindAhead` 分钟），通过 Toast 提示。浏览器关闭后所有定时器都会丢失（Web API 限制），未来如需后台提醒可接入 Service Worker。

### 搜索防抖

`Toolbar.vue` 与 `MobileToolbar.vue` 都使用 `useDebouncedRef(value, 250)` 包装搜索框，避免每次按键都触发 `store.filteredTasks` 重算。

## 默认账号

首次启动会进入锁屏，**默认 PIN：`1234`**。可在「设置 → 修改 PIN」中更改，或在设置中关闭 PIN 保护。

> ⚠️ PIN 以明文存储于 `localStorage`，仅用于防误触，不具备加密安全性。

## 浏览器要求

- 支持 ES Modules 的现代浏览器（Chrome 90+、Edge 90+、Safari 14+、Firefox 88+）
- 需开启 `localStorage`（无痕模式下数据不会持久化）
- 通知提醒依赖 Web `setTimeout`，关闭浏览器后失效

## 许可

本项目仅供学习与个人使用。
