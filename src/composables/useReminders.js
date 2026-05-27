import { toastService } from './useToast.js'

let timers = []

export function scheduleReminders(tasks, settings) {
  timers.forEach(id => clearTimeout(id))
  timers = []
  if (!settings.notifEnabled) return

  const ahead = (settings.remindAhead || 30) * 60 * 1000
  tasks.forEach(task => {
    if (task.done) return
    if (task.reminder) {
      const diff = new Date(task.reminder).getTime() - Date.now()
      if (diff > 0 && diff < 86400000) {
        timers.push(setTimeout(() => {
          toastService.showToast('⏰ 提醒：「' + task.title + '」即将到期！', 'warn')
        }, diff))
      }
    }
    if (task.deadline) {
      const preDiff = new Date(task.deadline).getTime() - ahead - Date.now()
      if (preDiff > 0 && preDiff < 86400000) {
        timers.push(setTimeout(() => {
          toastService.showToast('⚠️「' + task.title + '」距截止还有 ' + settings.remindAhead + ' 分钟！', 'warn')
        }, preDiff))
      }
    }
  })
}

export function clearAllReminders() {
  timers.forEach(id => clearTimeout(id))
  timers = []
}
