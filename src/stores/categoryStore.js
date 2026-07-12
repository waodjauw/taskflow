import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { genCatId } from "../utils/helpers.js";
import { useTaskStore } from "./taskStore.js";

const STORAGE_KEY = "taskflow_categories";

export const useCategoryStore = defineStore("category", () => {
  const categories = ref([
    { id: "work", name: "工作", color: "#6366f1" },
    { id: "study", name: "学习", color: "#0ea5e9" },
    { id: "personal", name: "个人", color: "#ec4899" },
    { id: "health", name: "健康", color: "#22c55e" },
    { id: "finance", name: "财务", color: "#f59e0b" },
  ]);

  const categoryBadges = computed(() => {
    const taskStore = useTaskStore();
    const result = {};
    categories.value.forEach((cat) => {
      result[cat.id] = taskStore.tasks.filter((t) => t.cat === cat.id).length;
    });
    return result;
  });

  function addCategory(name, color) {
    if (!name.trim()) { toastService.showToast("请输入类别名称", "error"); return false; }
    if (categories.value.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toastService.showToast("类别名称已存在", "error"); return false;
    }
    categories.value.push({ id: genCatId(), name: name.trim(), color });
    toastService.showToast("类别「" + name + "」已添加", "success");
    return true;
  }

  function deleteCategory(id) {
    const taskStore = useTaskStore();
    if (taskStore.tasks.some((t) => t.cat === id)) {
      toastService.showToast("该类别下还有任务，无法删除", "error");
      return;
    }
    categories.value = categories.value.filter((c) => c.id !== id);
    toastService.showToast("类别已删除", "info");
  }

  return { categories, categoryBadges, addCategory, deleteCategory };
},
{
  persist: { key: STORAGE_KEY, storage: localStorage },
});
