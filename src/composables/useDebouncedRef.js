import { ref, watch } from 'vue'

export function useDebouncedRef(initial, delay = 250) {
  const local = ref(initial)
  const debounced = ref(initial)
  let timer = null
  watch(local, (v) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = v }, delay)
  })
  return { local, debounced }
}
