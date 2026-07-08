import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { genId, isToday, isThisWeek, isThisMonth, isOverdue, advanceDeadline } from "../utils/helpers.js";

const STORAGE_KEY = "taskflow_tasks";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
    filters: { search: "", cat: "", cycle: "", priority: "" },
    activeNav: "all",
  }),

  persist: {
    key: STORAGE_KEY,
    storage: localStorage,
    paths: ["tasks"],
  },

  getters: {
    filteredTasks(state) {
      let tasks = [...state.tasks];
      const nav = state.activeNav;
      if (nav === "today") tasks = tasks.filter((t) => isToday(t.deadline));
      else if (nav === "week")
        tasks = tasks.filter((t) => isThisWeek(t.deadline));
      else if (nav === "overdue") tasks = tasks.filter((t) => isOverdue(t));
      else if (nav === "done") tasks = tasks.filter((t) => t.done);
      else if (nav.startsWith("p-"))
        tasks = tasks.filter((t) => t.priority === nav.replace("p-", ""));
      else if (nav.startsWith("cat-"))
        tasks = tasks.filter((t) => t.cat === nav.replace("cat-", ""));

      const { search, cat, cycle, priority } = state.filters;
      if (search) {
        const q = search.toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.desc || "").toLowerCase().includes(q),
        );
      }
      if (cat) tasks = tasks.filter((t) => t.cat === cat);
      if (priority) tasks = tasks.filter((t) => t.priority === priority);
      if (cycle === "today") tasks = tasks.filter((t) => isToday(t.deadline));
      else if (cycle === "week")
        tasks = tasks.filter((t) => isThisWeek(t.deadline));
      else if (cycle === "month")
        tasks = tasks.filter((t) => isThisMonth(t.deadline));
      else if (cycle === "overdue") tasks = tasks.filter((t) => isOverdue(t));

      const po = { critical: 0, high: 1, medium: 2, low: 3 };
      tasks.sort((a, b) => {
        if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
        if (a.done !== b.done) return a.done ? 1 : -1;
        return (po[a.priority] ?? 2) - (po[b.priority] ?? 2);
      });
      return tasks;
    },

    stats(state) {
      const all = state.tasks;
      const total = all.length;
      const done = all.filter((t) => t.done).length;
      const inProgress = all.filter(
        (t) => !t.done && (t.progress || 0) > 0,
      ).length;
      const overdue = all.filter((t) => isOverdue(t)).length;
      const rate = total ? Math.round((done / total) * 100) : 0;
      return {
        total,
        done,
        inProgress,
        overdue,
        rate,
        inProgressRatio: total ? (inProgress / total) * 100 : 0,
        doneRatio: total ? (done / total) * 100 : 0,
        overdueRatio: total ? (overdue / total) * 100 : 0,
      };
    },

    navBadges(state) {
      const all = state.tasks;
      return {
        all: all.length,
        today: all.filter((t) => isToday(t.deadline)).length,
        week: all.filter((t) => isThisWeek(t.deadline)).length,
        overdue: all.filter((t) => isOverdue(t)).length,
        done: all.filter((t) => t.done).length,
        critical: all.filter((t) => t.priority === "critical").length,
        high: all.filter((t) => t.priority === "high").length,
        medium: all.filter((t) => t.priority === "medium").length,
        low: all.filter((t) => t.priority === "low").length,
      };
    },

    overallProgress(state) {
      const total = state.tasks.length;
      const done = state.tasks.filter((t) => t.done).length;
      return total ? Math.round((done / total) * 100) : 0;
    },

    weeklyRate(state) {
      const weekTasks = state.tasks.filter((t) => isThisWeek(t.deadline));
      const weekDone = weekTasks.filter((t) => t.done).length;
      return weekTasks.length
        ? Math.round((weekDone / weekTasks.length) * 100)
        : 0;
    },

    alertTasks(state) {
      const overdue = state.tasks.filter((t) => isOverdue(t) && !t.done);
      const urgent = state.tasks.filter((t) => {
        if (!t.deadline || t.done) return false;
        const diff = new Date(t.deadline) - new Date();
        return diff > 0 && diff < 2 * 3600000;
      });
      return { overdue, urgent };
    },

    hasAlerts(state) {
      return state.tasks.some(
        (t) =>
          (isOverdue(t) && !t.done) ||
          (!t.done &&
            t.deadline &&
            new Date(t.deadline) - new Date() < 2 * 3600000 &&
            new Date(t.deadline) > new Date()),
      );
    },
  },

  actions: {
    _seedDemoData() {
      const now = new Date();
      const fmt = (d) => d.toISOString().slice(0, 16);
      const d = (n) => {
        const x = new Date(now);
        x.setDate(x.getDate() + n);
        return x;
      };
      this.tasks = [
        { id: "t1", title: "完成Q4季度报告", desc: "整理数据并制作PPT演示文稿", cat: "work", priority: "critical", deadline: fmt(d(0)), reminder: fmt(d(0)), progress: 65, done: false, cycle: "none", createdAt: now.toISOString() },
        { id: "t2", title: "阅读《深度工作》第三章", desc: "做读书笔记，提炼核心观点", cat: "study", priority: "medium", deadline: fmt(d(2)), reminder: fmt(d(1)), progress: 30, done: false, cycle: "none", createdAt: now.toISOString() },
        { id: "t3", title: "每日晨跑 5km", desc: "保持健康习惯", cat: "health", priority: "low", deadline: fmt(d(0)), reminder: "", progress: 0, done: false, cycle: "daily", createdAt: now.toISOString() },
        { id: "t4", title: "审核项目合同条款", desc: "重点核查第5、8、11条款", cat: "finance", priority: "high", deadline: fmt(d(-1)), reminder: "", progress: 80, done: false, cycle: "none", createdAt: now.toISOString() },
        { id: "t5", title: "准备团队周会议程", desc: "收集各组进展，整理议题", cat: "work", priority: "high", deadline: fmt(d(1)), reminder: fmt(d(1)), progress: 40, done: false, cycle: "weekly", createdAt: now.toISOString() },
        { id: "t6", title: "更新个人知识库", desc: "将本周学习内容归档至 Notion", cat: "personal", priority: "low", deadline: fmt(d(3)), reminder: "", progress: 10, done: true, cycle: "none", createdAt: now.toISOString() },
        { id: "t7", title: "系统性能优化方案", desc: "分析慢查询，制定索引策略", cat: "work", priority: "medium", deadline: fmt(d(5)), reminder: "", progress: 0, done: false, cycle: "none", createdAt: now.toISOString() },
        { id: "t8", title: "月度家庭预算规划", desc: "记录收支，制定下月预算", cat: "finance", priority: "medium", deadline: fmt(d(7)), reminder: "", progress: 50, done: false, cycle: "monthly", createdAt: now.toISOString() },
      ];
    },

    isDuplicateTask(title, deadlineStr, excludeId) {
      const titleNorm = title.trim().toLowerCase();
      const date = deadlineStr ? new Date(deadlineStr).toDateString() : "__none__";
      return this.tasks.some((t) => {
        if (t.id === excludeId) return false;
        const tDate = t.deadline ? new Date(t.deadline).toDateString() : "__none__";
        return t.title.trim().toLowerCase() === titleNorm && tDate === date;
      });
    },

    addTask(payload) {
      if (this.isDuplicateTask(payload.title, payload.deadline, null)) {
        toastService.showToast("任务重复！相同标题+日期已存在", "error");
        return false;
      }
      this.tasks.push({ id: genId(), ...payload, done: false, createdAt: new Date().toISOString() });
      toastService.showToast("任务已添加", "success");
      return true;
    },

    updateTask(id, payload) {
      if (this.isDuplicateTask(payload.title, payload.deadline, id)) {
        toastService.showToast("任务重复！相同标题+日期已存在", "error");
        return false;
      }
      const idx = this.tasks.findIndex((t) => t.id === id);
      if (idx >= 0) Object.assign(this.tasks[idx], payload);
      toastService.showToast("任务已更新", "success");
      return true;
    },

    deleteTask(id) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      toastService.showToast("任务已删除", "info");
    },

    toggleComplete(id) {
      const t = this.tasks.find((x) => x.id === id);
      if (!t) return;
      if (!t.done && t.cycle && t.cycle !== "none" && t.deadline) {
        t.deadline = advanceDeadline(t.deadline, t.cycle);
        if (t.reminder) t.reminder = advanceDeadline(t.reminder, t.cycle);
        t.progress = 0;
        toastService.showToast("本轮完成 🎉 已推进到下一周期", "success");
        return;
      }
      t.done = !t.done;
      if (t.done) t.progress = 100;
      toastService.showToast(t.done ? "任务已完成 🎉" : "任务已重新开启", t.done ? "success" : "info");
    },

    updateProgress(id, val) {
      const t = this.tasks.find((x) => x.id === id);
      if (!t) return;
      if (val === 100 && t.cycle && t.cycle !== "none" && t.deadline) {
        t.deadline = advanceDeadline(t.deadline, t.cycle);
        if (t.reminder) t.reminder = advanceDeadline(t.reminder, t.cycle);
        t.progress = 0;
        toastService.showToast("本轮完成 🎉 已推进到下一周期", "success");
        return;
      }
      t.progress = val;
      if (val === 100) t.done = true;
      toastService.showToast("进度已更新为 " + val + "%", "success");
    },

    setFilter(key, val) { this.filters[key] = val; },
    setActiveNav(nav) { this.activeNav = nav; },

    syncFromRoute(route) {
      const p = route.path;
      if (p === "/") this.activeNav = "all";
      else if (p === "/today") this.activeNav = "today";
      else if (p === "/week") this.activeNav = "week";
      else if (p === "/overdue") this.activeNav = "overdue";
      else if (p === "/done") this.activeNav = "done";
      else if (p.startsWith("/priority/")) this.activeNav = "p-" + route.params.priority;
      else if (p.startsWith("/category/")) this.activeNav = "cat-" + route.params.id;
      else this.activeNav = "all";
    },

    notifyBell() {
      const overdue = this.tasks.filter((t) => isOverdue(t) && !t.done);
      if (overdue.length) toastService.showToast("有 " + overdue.length + " 个任务已逾期！", "warn");
      else toastService.showToast("暂无待处理提醒", "info");
    },
  },
});
