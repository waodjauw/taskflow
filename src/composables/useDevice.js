import { ref, readonly } from 'vue'

const MOBILE_QUERY = '(max-width: 767px)'

const isMobile = ref(false)

let initialized = false

function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const mql = window.matchMedia(MOBILE_QUERY)
  const sync = () => { isMobile.value = mql.matches }
  sync()

  if (mql.addEventListener) mql.addEventListener('change', sync)
  else mql.addListener(sync)
}

export function useDevice() {
  initialize()
  return { isMobile: readonly(isMobile) }
}
