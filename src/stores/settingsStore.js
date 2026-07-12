import { reactive } from "vue";
import { defineStore } from "pinia";

const SETTINGS_KEY = "taskflow_settings";

export const useSettingsStore = defineStore("settings", () => {
  const settings = reactive({
    theme: "light", layout: "grid", cardStyle: "default",
    progressDisplay: "both", pinEnabled: false, notifEnabled: true,
    overdueAlert: true, remindAhead: 30,
  });

  function applyTheme(theme) {
    settings.theme = theme;
    document.documentElement.removeAttribute("data-theme");
    if (theme !== "light") document.documentElement.setAttribute("data-theme", theme);
  }

  function setLayout(layout) { settings.layout = layout; }
  function setCardStyle(style) { settings.cardStyle = style; }
  function setProgressDisplay(mode) { settings.progressDisplay = mode; }
  function toggleSetting(key) { settings[key] = !settings[key]; }
  function setRemindAhead(min) { settings.remindAhead = parseInt(min); }

  return { settings, applyTheme, setLayout, setCardStyle, setProgressDisplay, toggleSetting, setRemindAhead };
},
{
  persist: { key: SETTINGS_KEY, storage: localStorage },
});
