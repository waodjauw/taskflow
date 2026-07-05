import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../taskStore.js'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('taskStore', () => {
  describe('addTask', () => {
    it('adds a task to the list', () => {
      const store = useTaskStore()
      store.addTask({ title: '测试任务', cat: 'work', priority: 'medium' })
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].title).toBe('测试任务')
    })

    it('prevents duplicate task on same date', () => {
      const store = useTaskStore()
      store.addTask({ title: '测试', cat: 'work', priority: 'medium', deadline: '2026-07-15T10:00' })
      const result = store.addTask({ title: '测试', cat: 'work', priority: 'medium', deadline: '2026-07-15T10:00' })
      expect(result).toBe(false)
      expect(store.tasks).toHaveLength(1)
    })
  })

  describe('toggleComplete', () => {
    it('marks task as done', () => {
      const store = useTaskStore()
      store.addTask({ title: '测试', cat: 'work', priority: 'medium' })
      const task = store.tasks[0]
      store.toggleComplete(task.id)
      expect(store.tasks[0].done).toBe(true)
      expect(store.tasks[0].progress).toBe(100)
    })

    it('advances deadline for recurring tasks', () => {
      const store = useTaskStore()
      store.addTask({ title: '每日任务', cat: 'health', priority: 'low', deadline: '2026-07-15T08:00', cycle: 'daily' })
      const task = store.tasks[0]
      store.toggleComplete(task.id)
      expect(store.tasks[0].done).toBe(false)
      expect(store.tasks[0].progress).toBe(0)
      expect(store.tasks[0].deadline).toContain('2026-07-16')
    })
  })

  describe('filteredTasks', () => {
    it('filters by today nav', () => {
      const store = useTaskStore()
      const today = new Date().toISOString().slice(0, 16)
      store.addTask({ title: '今天任务', cat: 'work', priority: 'high', deadline: today })
      store.addTask({ title: '未来任务', cat: 'work', priority: 'low', deadline: '2099-01-01T00:00' })
      store.activeNav = 'today'
      expect(store.filteredTasks).toHaveLength(1)
      expect(store.filteredTasks[0].title).toBe('今天任务')
    })

    it('sorts overdue tasks first', () => {
      const store = useTaskStore()
      store.addTask({ title: '正常', cat: 'work', priority: 'medium', deadline: '2099-01-01T00:00' })
      store.addTask({ title: '逾期', cat: 'work', priority: 'medium', deadline: '2020-01-01T00:00' })
      expect(store.filteredTasks[0].title).toBe('逾期')
    })
  })
})
