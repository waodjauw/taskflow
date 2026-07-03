import { defineStore } from "pinia";
import { useTaskStore } from "./taskStore.js";

export const useContextMenuStore = defineStore("contextMenu", {
  state: () => ({
    contextTaskId: null,
    contextMenuPos: { x: 0, y: 0 },
  }),

  getters: {
    contextTask() {
      const taskStore = useTaskStore();
      return taskStore.tasks.find((t) => t.id === this.contextTaskId) || null;
    },
  },

  actions: {
    openContextMenu(taskId, x, y) {
      this.contextTaskId = taskId;
      this.contextMenuPos = { x, y };
    },

    closeContextMenu() {
      this.contextTaskId = null;
    },
  },
});
