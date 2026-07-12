import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { genId, isToday, isThisWeek, isThisMonth, isOverdue, advanceDeadline } from "../utils/helpers.js";

const STORAGE_KEY = "taskflow_tasks";

export const useTaskStore = defineStore("task", () => {
  const tasks = ref([]);
  const filters = ref({ search: "", cat: "", cycle: "", priority: "" });
  const activeNav = ref("all");

  const filteredTasks = computed(() => {
    let result = [...tasks.value];
    const nav = activeNav.value;
    if (nav === "today") result = result.filter((t) => isToday(t.deadline));
    else if (nav === "week") result = result.filter((t) => isThisWeek(t.deadline));
    else if (nav === "overdue") result = result.filter((t) => isOverdue(t));
    else if (nav === "done") result = result.filter((t) => t.done);
    else if (nav.startsWith("p-")) result = result.filter((t) => t.priority === nav.replace("p-", ""));
    else if (nav.startsWith("cat-")) result = result.filter((t) => t.cat === nav.replace("cat-", ""));

    const { search, cat, cycle, priority } = filters.value;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || (t.desc || "").toLowerCase().includes(q));
    }
    if (cat) result = result.filter((t) => t.cat === cat);
    if (priority) result = result.filter((t) => t.priority === priority);
    if (cycle === "today") result = result.filter((t) => isToday(t.deadline));
    else if (cycle === "week") result = result.filter((t) => isThisWeek(t.deadline));
    else if (cycle === "month") result = result.filter((t) => isThisMonth(t.deadline));
    else if (cycle === "overdue") result = result.filter((t) => isOverdue(t));

    const po = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (po[a.priority] ?? 2) - (po[b.priority] ?? 2);
    });
    return result;
  });

  const stats = computed(() => {
    const all = tasks.value;
    const total = all.length;
    const done = all.filter((t) => t.done).length;
    const inProgress = all.filter((t) => !t.done && (t.progress || 0) > 0).length;
    const overdue = all.filter((t) => isOverdue(t)).length;
    const rate = total ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, overdue, rate, inProgressRatio: total ? (inProgress / total) * 100 : 0, doneRatio: total ? (done / total) * 100 : 0, overdueRatio: total ? (overdue / total) * 100 : 0 };
  });

  const navBadges = computed(() => {
    const all = tasks.value;
    return {
      all: all.length, today: all.filter((t) => isToday(t.deadline)).length,
      week: all.filter((t) => isThisWeek(t.deadline)).length, overdue: all.filter((t) => isOverdue(t)).length,
      done: all.filter((t) => t.done).length, critical: all.filter((t) => t.priority === "critical").length,
      high: all.filter((t) => t.priority === "high").length, medium: all.filter((t) => t.priority === "medium").length,
      low: all.filter((t) => t.priority === "low").length,
    };
  });

  const overallProgress = computed(() => {
    const total = tasks.value.length;
    const done = tasks.value.filter((t) => t.done).length;
    return total ? Math.round((done / total) * 100) : 0;
  });

  const weeklyRate = computed(() => {
    const weekTasks = tasks.value.filter((t) => isThisWeek(t.deadline));
    const weekDone = weekTasks.filter((t) => t.done).length;
    return weekTasks.length ? Math.round((weekDone / weekTasks.length) * 100) : 0;
  });

  const alertTasks = computed(() => {
    const overdue = tasks.value.filter((t) => isOverdue(t) && !t.done);
    const urgent = tasks.value.filter((t) => {
      if (!t.deadline || t.done) return false;
      const diff = new Date(t.deadline) - new Date();
      return diff > 0 && diff < 2 * 3600000;
    });
    return { overdue, urgent };
  });

  const hasAlerts = computed(() => {
    return tasks.value.some((t) =>
      (isOverdue(t) && !t.done) ||
      (!t.done && t.deadline && new Date(t.deadline) - new Date() < 2 * 3600000 && new Date(t.deadline) > new Date())
    );
  });

  function _seedDemoData() {
    const now = new Date();
    const fmt = (d) => d.toISOString().slice(0, 16);
    const d = (n) => { const x = new Date(now); x.setDate(x.getDate() + n); return x; };
    tasks.value = [
      { id: "t1", title: "完成Q4季度报告", desc: "整理数据并制作PPT演示文稿", cat: "work", priority: "critical", deadline: fmt(d(0)), reminder: fmt(d(0)), progress: 65, done: false, cycle: "none", createdAt: now.toISOString() },
      { id: "t2", title: "阅读《深度工作》第三章", desc: "做读书笔记，提炼核心观点", cat: "study", priority: "medium", deadline: fmt(d(2)), reminder: fmt(d(1)), progress: 30, done: false, cycle: "none", createdAt: now.toISOString() },
      { id: "t3", title: "每日晨跑 5km", desc: "保持健康习惯", cat: "health", priority: "low", deadline: fmt(d(0)), reminder: "", progress: 0, done: false, cycle: "daily", createdAt: now.toISOString() },
      { id: "t4", title: "审核项目合同条款", desc: "重点核查第5、8、11条款", cat: "finance", priority: "high", deadline: fmt(d(-1)), reminder: "", progress: 80, done: false, cycle: "none", createdAt: now.toISOString() },
      { id: "t5", title: "准备团队周会议程", desc: "收集各组进展，整理议题", cat: "work", priority: "high", deadline: fmt(d(1)), reminder: fmt(d(1)), progress: 40, done: false, cycle: "weekly", createdAt: now.toISOString() },
      { id: "t6", title: "更新个人知识库", desc: "将本周学习内容归档至 Notion", cat: "personal", priority: "low", deadline: fmt(d(3)), reminder: "", progress: 10, done: true, cycle: "none", createdAt: now.toISOString() },
      { id: "t7", title: "系统性能优化方案", desc: "分析慢查询，制定索引策略", cat: "work", priority: "medium", deadline: fmt(d(5)), reminder: "", progress: 0, done: false, cycle: "none", createdAt: now.toISOString() },
      { id: "t8", title: "月度家庭预算规划", desc: "记录收支，制定下月预算", cat: "finance", priority: "medium", deadline: fmt(d(7)), reminder: "", progress: 50, done: false, cycle: "monthly", createdAt: now.toISOString() },
    ];
  }

  function isDuplicateTask(title, deadlineStr, excludeId) {
    const titleNorm = title.trim().toLowerCase();
    const date = deadlineStr ? new Date(deadlineStr).toDateString() : "__none__";
    return tasks.value.some((t) => {
      if (t.id === excludeId) return false;
      const tDate = t.deadline ? new Date(t.deadline).toDateString() : "__none__";
      return t.title.trim().toLowerCase() === titleNorm && tDate === date;
    });
  }

  function addTask(payload) {
    if (isDuplicateTask(payload.title, payload.deadline, null)) {
      toastService.showToast("任务重复！相同标题+日期已存在", "error");
      return false;
    }
    tasks.value.push({ id: genId(), ...payload, done: false, createdAt: new Date().toISOString() });
    toastService.showToast("任务已添加", "success");
    return true;
  }

  function updateTask(id, payload) {
    if (isDuplicateTask(payload.title, payload.deadline, id)) {
      toastService.showToast("任务重复！相同标题+日期已存在", "error");
      return false;
    }
    const idx = tasks.value.findIndex((t) => t.id === id);
    if (idx >= 0) Object.assign(tasks.value[idx], payload);
    toastService.showToast("任务已更新", "success");
    return true;
  }

  function deleteTask(id) {
    tasks.value = tasks.value.filter((t) => t.id !== id);
    toastService.showToast("任务已删除", "info");
  }

  function toggleComplete(id) {
    const t = tasks.value.find((x) => x.id === id);
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
  }

  function updateProgress(id, val) {
    const t = tasks.value.find((x) => x.id === id);
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
  }

  function setFilter(key, val) { filters.value[key] = val; }
  function setActiveNav(nav) { activeNav.value = nav; }

  function syncFromRoute(route) {
    const p = route.path;
    if (p === "/") activeNav.value = "all";
    else if (p === "/today") activeNav.value = "today";
    else if (p === "/week") activeNav.value = "week";
    else if (p === "/overdue") activeNav.value = "overdue";
    else if (p === "/done") activeNav.value = "done";
    else if (p.startsWith("/priority/")) activeNav.value = "p-" + route.params.priority;
    else if (p.startsWith("/category/")) activeNav.value = "cat-" + route.params.id;
    else activeNav.value = "all";
  }

  function notifyBell() {
    const overdue = tasks.value.filter((t) => isOverdue(t) && !t.done);
    if (overdue.length) toastService.showToast("有 " + overdue.length + " 个任务已逾期！", "warn");
    else toastService.showToast("暂无待处理提醒", "info");
  }

  return {
    tasks, filters, activeNav,
    filteredTasks, stats, navBadges, overallProgress, weeklyRate, alertTasks, hasAlerts,
    _seedDemoData, isDuplicateTask, addTask, updateTask, deleteTask,
    toggleComplete, updateProgress, setFilter, setActiveNav, syncFromRoute, notifyBell,
  };
},
{
  persist: { key: STORAGE_KEY, storage: localStorage, paths: ["tasks"] },
});
