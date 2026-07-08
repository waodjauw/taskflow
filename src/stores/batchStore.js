import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { useTaskStore } from "./taskStore.js";

export const useBatchStore = defineStore("batch", {
  state: () => ({
    selectedTasks: [],
    batchMode: false,
  }),

  actions: {
    toggleBatchMode() {
      this.batchMode = !this.batchMode;
      if (!this.batchMode) this.selectedTasks = [];
    },

    toggleSelectTask(id) {
      const idx = this.selectedTasks.indexOf(id);
      if (idx >= 0) this.selectedTasks.splice(idx, 1);
      else this.selectedTasks.push(id);
    },

    batchSelectAll() {
      const taskStore = useTaskStore();
      taskStore.filteredTasks.forEach((t) => {
        if (!this.selectedTasks.includes(t.id)) this.selectedTasks.push(t.id);
      });
    },

    batchMarkDone(done) {
      if (this.selectedTasks.length === 0) {
        toastService.showToast("请先选择任务", "warn");
        return;
      }
      const taskStore = useTaskStore();
      this.selectedTasks.forEach((id) => {
        const t = taskStore.tasks.find((x) => x.id === id);
        if (t) { t.done = done; if (done) t.progress = 100; }
      });
      this.selectedTasks = [];
      toastService.showToast(done ? "已批量标记完成" : "已批量标记未完成", "success");
    },

    batchDelete() {
      if (this.selectedTasks.length === 0) {
        toastService.showToast("请先选择任务", "warn");
        return;
      }
      const cnt = this.selectedTasks.length;
      const taskStore = useTaskStore();
      taskStore.tasks = taskStore.tasks.filter((t) => !this.selectedTasks.includes(t.id));
      this.selectedTasks = [];
      toastService.showToast("已删除 " + cnt + " 个任务", "info");
    },
  },
});
