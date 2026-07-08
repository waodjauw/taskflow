import { defineStore } from "pinia";

const SETTINGS_KEY = "taskflow_settings";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    settings: {
      theme: "light",
      layout: "grid",
      cardStyle: "default",
      progressDisplay: "both",
      pinEnabled: false,
      notifEnabled: true,
      overdueAlert: true,
      remindAhead: 30,
    },
  }),

  persist: {
    key: SETTINGS_KEY,
    storage: localStorage,
  },

  actions: {
    applyTheme(theme) {
      this.settings.theme = theme;
      document.documentElement.removeAttribute("data-theme");
      if (theme !== "light")
        document.documentElement.setAttribute("data-theme", theme);
    },

    setLayout(layout) { this.settings.layout = layout; },
    setCardStyle(style) { this.settings.cardStyle = style; },
    setProgressDisplay(mode) { this.settings.progressDisplay = mode; },
    toggleSetting(key) { this.settings[key] = !this.settings[key]; },
    setRemindAhead(min) { this.settings.remindAhead = parseInt(min); },
  },
});
