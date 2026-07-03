export function genId() { return 't' + Date.now() + Math.random().toString(36).slice(2, 6) }
export function genCatId() { return 'c' + Date.now() + Math.random().toString(36).slice(2, 5) }

export function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr), t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

export function isThisWeek(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr), now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - now.getDay())
  const end = new Date(start); end.setDate(start.getDate() + 6)
  start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999)
  return d >= start && d <= end
}

export function isThisMonth(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr), t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth()
}

export function isOverdue(task) {
  if (!task.deadline || task.done) return false
  return new Date(task.deadline) < new Date()
}

export function formatDeadline(dl) {
  if (!dl) return ''
  const d = new Date(dl)
  return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

export function toLocalInputStr(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

export function advanceDeadline(dl, cycle) {
  if (!dl) return dl
  const d = new Date(dl)
  if (isNaN(d.getTime())) return dl
  if (cycle === 'daily') d.setDate(d.getDate() + 1)
  else if (cycle === 'weekly') d.setDate(d.getDate() + 7)
  else if (cycle === 'monthly') d.setMonth(d.getMonth() + 1)
  else return dl
  return toLocalInputStr(d)
}

export function getPriorityLabel(p) {
  return { critical: '🔴 紧急', high: '🟠 高', medium: '🟡 中', low: '🟢 低' }[p] || p
}

export function getPriorityTagClass(p) {
  return { critical: 'tag-priority-critical', high: 'tag-priority-high', medium: 'tag-priority-medium', low: 'tag-priority-low' }[p] || ''
}
