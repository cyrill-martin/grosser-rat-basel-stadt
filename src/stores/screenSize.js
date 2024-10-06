import { ref, computed } from "vue"
import { defineStore } from "pinia"

const mobileThreshold = 768

export const useScreenSizeStore = defineStore("screenSize", () => {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  const isMobile = computed(() => width.value < mobileThreshold)

  function updateScreenSize() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  return { width, height, isMobile, updateScreenSize }
})
