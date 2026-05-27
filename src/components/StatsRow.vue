<template>
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-label">总任务</div>
      <div class="stat-value">{{ store.stats.total }}</div>
      <div class="stat-sub">所有待办</div>
      <div class="stat-progress"><div class="stat-progress-fill" style="width:100%;background:var(--accent);"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">进行中</div>
      <div class="stat-value">{{ store.stats.inProgress }}</div>
      <div class="stat-sub">正在处理</div>
      <div class="stat-progress"><div class="stat-progress-fill" :style="{ width: store.stats.inProgressRatio + '%', background: '#6366f1' }"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">已完成</div>
      <div class="stat-value">{{ store.stats.done }}</div>
      <div class="stat-sub">成功关闭</div>
      <div class="stat-progress"><div class="stat-progress-fill" :style="{ width: store.stats.doneRatio + '%', background: '#22c55e' }"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">已逾期</div>
      <div class="stat-value" style="color:#ef4444;">{{ store.stats.overdue }}</div>
      <div class="stat-sub">需立即处理</div>
      <div class="stat-progress"><div class="stat-progress-fill" :style="{ width: store.stats.overdueRatio + '%', background: '#ef4444' }"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">总完成率</div>
      <div class="stat-value">{{ store.stats.rate }}%</div>
      <div class="stat-sub">整体进度</div>
      <div class="stat-progress"><div class="stat-progress-fill" :style="{ width: store.stats.rate + '%', background: 'linear-gradient(90deg,#6366f1,#4f46e5)' }"></div></div>
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from '../stores/taskStore.js'
const store = useTaskStore()
</script>
