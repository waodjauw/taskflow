import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useTaskStore } from "./taskStore.js";

export const useContextMenuStore = defineStore("contextMenu", () => {
  const contextTaskId = ref(null);
  const contextMenuPos = ref({ x: 0, y: 0 });

  const contextTask = computed(() => {
    const taskStore = useTaskStore();
    return taskStore.tasks.find((t) => t.id === contextTaskId.value) || null;
  });

  function openContextMenu(taskId, x, y) {
    contextTaskId.value = taskId;
    contextMenuPos.value = { x, y };
  }

  function closeContextMenu() { contextTaskId.value = null; }

  return { contextTaskId, contextMenuPos, contextTask, openContextMenu, closeContextMenu };
});
