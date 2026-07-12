import { ref } from "vue";
import { defineStore } from "pinia";
import { toastService } from "../composables/useToast.js";
import { useSettingsStore } from "./settingsStore.js";

const PIN_KEY = "taskflow_pin";

export const useAuthStore = defineStore("auth", () => {
  const pin = ref("1234");
  const isLocked = ref(false);

  function init() {
    const settingsStore = useSettingsStore();
    isLocked.value = settingsStore.settings.pinEnabled;
  }

  function verifyPin(inputPin) {
    if (inputPin === pin.value) {
      isLocked.value = false;
      toastService.showToast("解锁成功，欢迎回来！", "success");
      return true;
    }
    return false;
  }

  function lockApp() { isLocked.value = true; }

  function changePin(oldPin, newPin, confirmPin) {
    if (oldPin !== pin.value) return { ok: false, msg: "当前 PIN 码错误" };
    if (newPin.length !== 4) return { ok: false, msg: "PIN 码必须为 4 位" };
    if (newPin !== confirmPin) return { ok: false, msg: "两次输入不一致" };
    pin.value = newPin;
    toastService.showToast("PIN 码已修改", "success");
    return { ok: true };
  }

  return { pin, isLocked, init, verifyPin, lockApp, changePin };
},
{
  persist: { key: PIN_KEY, storage: localStorage, paths: ["pin"] },
});
