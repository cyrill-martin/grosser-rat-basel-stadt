import { useScreenSizeStore } from "../stores/screenSize.js"

export default {
  install() {
    const screenSizeStore = useScreenSizeStore()
    function updateScreenSize() {
      screenSizeStore.updateScreenSize()
    }
    window.addEventListener("resize", updateScreenSize)
  }
}
