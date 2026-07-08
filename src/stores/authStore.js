import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { useSettingsStore } from "./settingsStore.js";

const PIN_KEY = "taskflow_pin";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    pin: "1234",
    isLocked: false,
  }),

  persist: {
    key: PIN_KEY,
    storage: localStorage,
    paths: ["pin"],
  },

  actions: {
    init() {
      const settingsStore = useSettingsStore();
      this.isLocked = settingsStore.settings.pinEnabled;
    },

    verifyPin(inputPin) {
      if (inputPin === this.pin) {
        this.isLocked = false;
        toastService.showToast("解锁成功，欢迎回来！", "success");
        return true;
      }
      return false;
    },

    lockApp() { this.isLocked = true; },

    changePin(oldPin, newPin, confirmPin) {
      if (oldPin !== this.pin) return { ok: false, msg: "当前 PIN 码错误" };
      if (newPin.length !== 4) return { ok: false, msg: "PIN 码必须为 4 位" };
      if (newPin !== confirmPin) return { ok: false, msg: "两次输入不一致" };
      this.pin = newPin;
      toastService.showToast("PIN 码已修改", "success");
      return { ok: true };
    },
  },
});
