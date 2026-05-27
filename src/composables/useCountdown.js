import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useCountdown(deadlineRef) {
  const countdownText = ref(null)
  const countdownClass = ref('')
  let timer = null

  function update() {
    const deadline = typeof deadlineRef === 'function' ? deadlineRef() : deadlineRef.value
    if (!deadline) {
      countdownText.value = null
      return
    }
    const diff = new Date(deadline) - new Date()
    if (diff < 0) {
      countdownText.value = '已逾期'
      countdownClass.value = 'countdown-chip'
      return
    }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h < 2) {
      countdownText.value = h + 'h ' + m + 'm 后到期'
      countdownClass.value = 'countdown-chip'
    } else if (h < 24) {
      countdownText.value = h + ' 小时后到期'
      countdownClass.value = 'countdown-chip warn'
    } else {
      const days = Math.floor(h / 24)
      if (days <= 3) {
        countdownText.value = days + ' 天后到期'
        countdownClass.value = 'countdown-chip warn'
      } else {
        countdownText.value = null
        countdownClass.value = ''
      }
    }
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 60000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  if (deadlineRef && typeof deadlineRef === 'object' && 'value' in deadlineRef) {
    watch(deadlineRef, update)
  }

  return { countdownText, countdownClass }
}
