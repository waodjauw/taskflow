<template>
  <Teleport to="body">
    <div v-show="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <div style="width:36px;height:36px;background:var(--accent-light);border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--accent);">
            <Settings2 :size="18" />
          </div>
          <div class="modal-title">偏好设置</div>
          <div class="modal-close" @click="close"><X :size="16" /></div>
        </div>
        <div class="modal-body" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <!-- Left Column -->
          <div>
            <!-- Theme -->
            <div class="settings-section">
              <div class="settings-section-title"><Palette :size="15" /> 主题模式</div>
              <div class="theme-options">
                <div class="theme-option" :class="{ active: store.settings.theme === 'light' }" @click="store.applyTheme('light')">☀️ 亮色</div>
                <div class="theme-option" :class="{ active: store.settings.theme === 'dark' }" @click="store.applyTheme('dark')">🌙 深色</div>
                <div class="theme-option" :class="{ active: store.settings.theme === 'eye' }" @click="store.applyTheme('eye')">🌿 护眼</div>
              </div>
            </div>
            <!-- Layout -->
            <div class="settings-section">
              <div class="settings-section-title"><LayoutGrid :size="15" /> 布局方式</div>
              <div class="layout-options">
                <div class="layout-option" :class="{ active: store.settings.layout === 'grid' }" @click="store.setLayout('grid')">
                  <LayoutGrid :size="13" /> 网格
                </div>
                <div class="layout-option" :class="{ active: store.settings.layout === 'list' }" @click="store.setLayout('list')">
                  <List :size="13" /> 列表
                </div>
              </div>
            </div>
            <!-- Card Style -->
            <div class="settings-section">
              <div class="settings-section-title"><Square :size="15" /> 任务卡样式</div>
              <div class="card-style-preview">
                <div class="card-style-opt" :class="{ active: store.settings.cardStyle === 'default' }" @click="store.setCardStyle('default')">
                  <CreditCard :size="14" /> 标准
                </div>
                <div class="card-style-opt" :class="{ active: store.settings.cardStyle === 'compact' }" @click="store.setCardStyle('compact')">
                  <MinusSquare :size="14" /> 紧凑
                </div>
                <div class="card-style-opt" :class="{ active: store.settings.cardStyle === 'spacious' }" @click="store.setCardStyle('spacious')">
                  <Maximize2 :size="14" /> 宽松
                </div>
              </div>
            </div>
            <!-- Progress Display -->
            <div class="settings-section">
              <div class="settings-section-title"><BarChart2 :size="15" /> 进度显示方式</div>
              <div class="layout-options">
                <div class="layout-option" :class="{ active: store.settings.progressDisplay === 'both' }" @click="store.setProgressDisplay('both')">进度条+百分比</div>
                <div class="layout-option" :class="{ active: store.settings.progressDisplay === 'bar' }" @click="store.setProgressDisplay('bar')">仅进度条</div>
                <div class="layout-option" :class="{ active: store.settings.progressDisplay === 'pct' }" @click="store.setProgressDisplay('pct')">仅百分比</div>
              </div>
            </div>
          </div>
          <!-- Right Column -->
          <div>
            <!-- Security -->
            <div class="settings-section">
              <div class="settings-section-title"><Shield :size="15" /> 安全设置</div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">PIN 码锁定</div>
                  <div class="settings-desc">启动时需要输入 PIN 码</div>
                </div>
                <div class="toggle-switch" :class="{ on: store.settings.pinEnabled }" @click="store.toggleSetting('pinEnabled')">
                  <div class="toggle-knob"></div>
                </div>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">修改 PIN 码</div>
                  <div class="settings-desc">当前 PIN: ****</div>
                </div>
                <button class="btn-secondary" @click="openPinChange">修改</button>
              </div>
            </div>
            <!-- Notifications -->
            <div class="settings-section">
              <div class="settings-section-title"><Bell :size="15" /> 通知提醒</div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">到期提醒</div>
                  <div class="settings-desc">任务临近截止时通知</div>
                </div>
                <div class="toggle-switch" :class="{ on: store.settings.notifEnabled }" @click="store.toggleSetting('notifEnabled')">
                  <div class="toggle-knob"></div>
                </div>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">提前提醒时间</div>
                  <div class="settings-desc">在截止前多久提醒</div>
                </div>
                <select class="filter-select" style="width:100px;" :value="store.settings.remindAhead" @change="store.setRemindAhead($event.target.value)">
                  <option value="15">15 分钟</option>
                  <option value="30">30 分钟</option>
                  <option value="60">1 小时</option>
                  <option value="120">2 小时</option>
                  <option value="1440">1 天</option>
                </select>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-label">逾期警报</div>
                  <div class="settings-desc">显示红色预警横幅</div>
                </div>
                <div class="toggle-switch" :class="{ on: store.settings.overdueAlert }" @click="store.toggleSetting('overdueAlert')">
                  <div class="toggle-knob"></div>
                </div>
              </div>
            </div>
            <!-- Categories -->
            <div class="settings-section">
              <div class="settings-section-title"><Tag :size="15" /> 类别管理</div>
              <div style="display:flex;flex-direction:column;gap:6px;max-height:140px;overflow-y:auto;margin-bottom:10px;">
                <div v-for="cat in catStore.categories" :key="cat.id" style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg-primary);border-radius:8px;">
                  <span :style="{ width: '12px', height: '12px', background: cat.color, borderRadius: '50%', flexShrink: 0 }"></span>
                  <span style="flex:1;font-size:13px;color:var(--text-primary);">{{ cat.name }}</span>
                  <button @click="catStore.deleteCategory(cat.id)" style="padding:3px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-card);color:var(--text-muted);font-size:11px;cursor:pointer;">删除</button>
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <input type="text" class="form-input" v-model="newCatName" placeholder="新类别名称…" style="flex:1;min-width:140px;" />
                <div style="display:flex;gap:4px;">
                  <button v-for="c in colorPalette" :key="c"
                    @click="newCatColor = c"
                    :style="{
                      width:'28px', height:'28px', borderRadius:'50%', border:'2px solid ' + (newCatColor === c ? 'var(--text-primary)' : 'transparent'),
                      background: c, cursor:'pointer', outline:'none'
                    }"
                  />
                </div>
                <button class="btn-primary" @click="addCat" style="padding:8px 14px;">
                  <Plus :size="13" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="close">
            <Check :size="14" /> 保存并关闭
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore.js'
import { useCategoryStore } from '../../stores/categoryStore.js'
import { Settings2, X, Palette, LayoutGrid, List, Square, CreditCard, MinusSquare, Maximize2, BarChart2, Shield, Bell, Tag, Plus, Check } from 'lucide-vue-next'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'open-pin-change'])

const store = useSettingsStore()
const catStore = useCategoryStore()
const newCatName = ref('')
const newCatColor = ref('#6366f1')
const colorPalette = ['#6366f1', '#0ea5e9', '#ec4899', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#64748b']

function close() { emit('update:modelValue', false) }
function openPinChange() { close(); emit('open-pin-change') }
function addCat() {
  if (catStore.addCategory(newCatName.value, newCatColor.value)) newCatName.value = ''
}
</script>
