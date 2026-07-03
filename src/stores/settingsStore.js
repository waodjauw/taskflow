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

  actions: {
    loadFromStorage() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) Object.assign(this.settings, JSON.parse(raw));
      } catch (e) {
        // silent fail for settings
      }
    },

    _save() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch (e) {
        // silent fail for settings
      }
    },

    applyTheme(theme) {
      this.settings.theme = theme;
      document.documentElement.removeAttribute("data-theme");
      if (theme !== "light")
        document.documentElement.setAttribute("data-theme", theme);
      this._save();
    },

    setLayout(layout) {
      this.settings.layout = layout;
      this._save();
    },

    setCardStyle(style) {
      this.settings.cardStyle = style;
      this._save();
    },

    setProgressDisplay(mode) {
      this.settings.progressDisplay = mode;
      this._save();
    },

    toggleSetting(key) {
      this.settings[key] = !this.settings[key];
      this._save();
    },

    setRemindAhead(min) {
      this.settings.remindAhead = parseInt(min);
      this._save();
    },
  },
});
