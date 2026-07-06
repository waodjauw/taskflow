# TaskFlow Pro

基于 Vue 3 + Pinia 的智能待办事项管理系统，支持 PC、平板、手机三端响应式，数据本地持久化，集成 AI 自然语言创建任务、AI 拆解子任务、SSE 流式周报。零 UI 框架依赖，纯 CSS 构建。

## 在线地址

| 环境 | 地址 | AI 功能 |
|------|------|---------|
| Render（完整版） | https://taskflow-plst.onrender.com/ | ✅ 可用 |
| GitHub Pages | https://waodjauw.github.io/taskflow/ | 仅前端壳 |

> Render 免费套餐有 15 分钟休眠机制，首次打开可能稍慢（冷启动）。

## 功能

- **任务管理**：新建 / 编辑 / 删除 / 批量操作 / 进度跟踪
- **循环任务**：日/周/月任务完成后自动推进 deadline
- **多维筛选**：按视图、优先级、类别、关键词筛选，搜索带 250ms 防抖
- **AI 功能**：自然语言创建任务、AI 拆解子任务、SSE 流式生成周报（DeepSeek API）
- **截止提醒**：浏览器内 setTimeout 定时提醒
- **PIN 锁屏**：启动密码保护
- **响应式适配**：桌面三列网格 + 侧栏 / 平板两列 / 手机单列 + 抽屉 + 底部 sheet
- **统计数据**：完成率、逾期数、本周完成率、分类分布
- **本地持久化**：localStorage 自动保存，首次访问注入演示数据

## 技术栈

| 类型 | 选型 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 路由 | Vue Router 4 (Hash 模式) |
| 状态管理 | Pinia 2 (6 个独立 store) |
| 后端 | Express (API 代理 + 静态托管) |
| AI | DeepSeek API |
| 构建 | Vite 5 |
| 图标 | lucide-vue-next |
| 样式 | 原生 CSS + CSS 变量 |
| 测试 | Vitest + Playwright |
| CI/CD | GitHub Actions |
| 部署 | Render (完整版) + GitHub Pages (静态) |

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量（填入你的 DeepSeek API Key）
cp .env.example .env

# 启动开发服务器
npm run dev          # Vite :5173 + Express :3001 同时启动
```

## 部署

```bash
# Render（完整功能，含 AI）
# 连接 GitHub 仓库，自动从 main 分支构建部署
# Build: npm install && npm run build，Start: npm start
# 环境变量: DEEPSEEK_API_KEY

# GitHub Pages（仅前端静态，自动部署）
# push 到 main → GitHub Actions 自动测试 → 构建 → 部署
```

## 项目结构

```
taskflow/
├── index.html
├── vite.config.js
├── server/
│   └── index.js                    # Express 后端 + API 代理
├── src/
│   ├── main.js                     # 入口：注册 Pinia + Router
│   ├── App.vue                     # 根组件，按设备切换两套布局
│   ├── router/index.js             # Hash 路由 (7 条)
│   ├── stores/
│   │   ├── taskStore.js            # 任务 CRUD + 筛选 + 统计
│   │   ├── categoryStore.js        # 分类管理
│   │   ├── settingsStore.js        # 应用设置
│   │   ├── authStore.js            # PIN 锁
│   │   ├── batchStore.js           # 批量操作
│   │   └── contextMenuStore.js     # 右键菜单
│   ├── components/
│   │   ├── mobile/                 # 手机端专属组件
│   │   └── modals/                 # 弹窗组件
│   ├── composables/                # 组合式函数
│   ├── utils/helpers.js            # 工具函数
│   └── style/                      # CSS 文件
├── e2e/                            # Playwright E2E
├── .github/workflows/deploy.yml      # GitHub Actions：测试 → 构建 → 部署 Pages
```

## 产品要点

### 路由

| URL | 视图 |
|-----|------|
| `/` | 全部任务 |
| `/today` | 今日 |
| `/week` | 本周 |
| `/overdue` | 已逾期 |
| `/done` | 已完成 |
| `/priority/:p` | 按优先级 |
| `/category/:id` | 按分类 |

### store 拆分

| Store | 职责 | 持久化 key |
|-------|------|-----------|
| `useTaskStore` | 任务 CRUD、filteredTasks、stats | `taskflow_tasks` |
| `useCategoryStore` | 分类 CRUD、categoryBadges | `taskflow_categories` |
| `useSettingsStore` | 主题/布局/提醒设置 | `taskflow_settings` |
| `useAuthStore` | PIN + 锁定状态 | `taskflow_pin` |
| `useBatchStore` | 批量选择/操作 | 无 |
| `useContextMenuStore` | 右键菜单状态 | 无 |

单向依赖：`categoryStore`、`batchStore`、`contextMenuStore` → `taskStore`，`authStore` → `settingsStore`。

### 循环任务

`toggleComplete()` 检测 `cycle !== 'none'` 时调用 `advanceDeadline()` 推进截止日期到下一周期（daily +1d / weekly +7d / monthly +1mo），重置进度为 0，不标记完成。

### AI 功能

- 自然语言创建：输入一段话 → LLM 解析为结构化任务 → 表单预填 → 确认保存
- AI 拆解：输入大目标 → LLM 拆解为 3-6 个子任务 → 勾选批量添加
- 周报生成：本周任务数据 → SSE 流式生成 Markdown → 打字机效果 + 一键复制

### 双布局

桌面/平板用 `TopNav + Sidebar + ContentArea`，手机用 `MobileLayout`（独立组件树）。模态框、ContextMenu、Toast 始终挂在两棵树之外共享。

## 默认 PIN

首次启动 PIN 锁屏，默认密码：`1234`。可在设置中修改或关闭。

> PIN 明文存储于 localStorage，仅防误触，不具备安全性。

## 浏览器要求

支持 ES Modules 的现代浏览器（Chrome 90+、Edge 90+、Safari 14+、Firefox 88+）
