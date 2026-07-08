import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { genCatId } from "../utils/helpers.js";
import { useTaskStore } from "./taskStore.js";

const STORAGE_KEY = "taskflow_categories";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [
      { id: "work", name: "工作", color: "#6366f1" },
      { id: "study", name: "学习", color: "#0ea5e9" },
      { id: "personal", name: "个人", color: "#ec4899" },
      { id: "health", name: "健康", color: "#22c55e" },
      { id: "finance", name: "财务", color: "#f59e0b" },
    ],
  }),

  persist: {
    key: STORAGE_KEY,
    storage: localStorage,
  },

  getters: {
    categoryBadges() {
      const taskStore = useTaskStore();
      const result = {};
      this.categories.forEach((cat) => {
        result[cat.id] = taskStore.tasks.filter((t) => t.cat === cat.id).length;
      });
      return result;
    },
  },

  actions: {
    addCategory(name, color) {
      if (!name.trim()) {
        toastService.showToast("请输入类别名称", "error");
        return false;
      }
      if (this.categories.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
        toastService.showToast("类别名称已存在", "error");
        return false;
      }
      this.categories.push({ id: genCatId(), name: name.trim(), color });
      toastService.showToast("类别「" + name + "」已添加", "success");
      return true;
    },

    deleteCategory(id) {
      const taskStore = useTaskStore();
      if (taskStore.tasks.some((t) => t.cat === id)) {
        toastService.showToast("该类别下还有任务，无法删除", "error");
        return;
      }
      this.categories = this.categories.filter((c) => c.id !== id);
      toastService.showToast("类别已删除", "info");
    },
  },
});
