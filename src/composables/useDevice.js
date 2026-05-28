import { ref, readonly } from 'vue'

const MOBILE_QUERY = '(max-width: 767px)'
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)'
const DESKTOP_QUERY = '(min-width: 1024px)'

const isMobile = ref(false)
const isTablet = ref(false)
const isDesktop = ref(true)

let initialized = false

function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const mobileMql = window.matchMedia(MOBILE_QUERY)
  const tabletMql = window.matchMedia(TABLET_QUERY)
  const desktopMql = window.matchMedia(DESKTOP_QUERY)

  const sync = () => {
    isMobile.value = mobileMql.matches
    isTablet.value = tabletMql.matches
    isDesktop.value = desktopMql.matches
  }

  sync()

  const addListener = (mql) => {
    if (mql.addEventListener) mql.addEventListener('change', sync)
    else mql.addListener(sync)
  }

  addListener(mobileMql)
  addListener(tabletMql)
  addListener(desktopMql)
}

export function useDevice() {
  initialize()
  return {
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
  }
}
