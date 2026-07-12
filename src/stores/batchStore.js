import { ref } from "vue";
import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { useTaskStore } from "./taskStore.js";

export const useBatchStore = defineStore("batch", () => {
  const selectedTasks = ref([]);
  const batchMode = ref(false);

  function toggleBatchMode() {
    batchMode.value = !batchMode.value;
    if (!batchMode.value) selectedTasks.value = [];
  }

  function toggleSelectTask(id) {
    const idx = selectedTasks.value.indexOf(id);
    if (idx >= 0) selectedTasks.value.splice(idx, 1);
    else selectedTasks.value.push(id);
  }

  function batchSelectAll() {
    const taskStore = useTaskStore();
    taskStore.filteredTasks.forEach((t) => {
      if (!selectedTasks.value.includes(t.id)) selectedTasks.value.push(t.id);
    });
  }

  function batchMarkDone(done) {
    if (selectedTasks.value.length === 0) { toastService.showToast("请先选择任务", "warn"); return; }
    const taskStore = useTaskStore();
    selectedTasks.value.forEach((id) => {
      const t = taskStore.tasks.find((x) => x.id === id);
      if (t) { t.done = done; if (done) t.progress = 100; }
    });
    selectedTasks.value = [];
    toastService.showToast(done ? "已批量标记完成" : "已批量标记未完成", "success");
  }

  function batchDelete() {
    if (selectedTasks.value.length === 0) { toastService.showToast("请先选择任务", "warn"); return; }
    const cnt = selectedTasks.value.length;
    const taskStore = useTaskStore();
    taskStore.tasks = taskStore.tasks.filter((t) => !selectedTasks.value.includes(t.id));
    selectedTasks.value = [];
    toastService.showToast("已删除 " + cnt + " 个任务", "info");
  }

  return { selectedTasks, batchMode, toggleBatchMode, toggleSelectTask, batchSelectAll, batchMarkDone, batchDelete };
});
