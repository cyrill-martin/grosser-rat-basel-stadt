<script setup>
import { NFlex } from "naive-ui"
import { computed } from "vue"
// import { debounce } from "../utils/debounce.js"
import { useScreenSizeStore } from "../stores/screenSize.js"
import { useCouncilStore } from "../stores/council.js"
import TheCouncilSelection from "../components/TheCouncilSelection.vue"

// Use a handler for i18n
import { useI18n } from "vue-i18n"
const { t } = useI18n()

const screenSize = useScreenSizeStore()
const council = useCouncilStore()

const title = computed(() => {
  return council.asOfDate && council.membersAsOfDate
    ? `${t("home.title.councilAsOfDate")} ${council.asOfDate}`
    : t("home.title.councilCurrent")
})

// // Watch screen size
// watch(
//   () => screenSize.width,
//   () => {
//     debouncedRecreate()
//   }
// )

// // Handle things after screen size changes
// const debouncedRecreate = debounce(() => {
//   console.log("screen size changed!")
// }, 500)
</script>

<template>
  <n-flex :size="0" vertical>
    <div class="date-selection">
      <n-flex :size="0" :vertical="screenSize.isMobile">
        <TheCouncilSelection />
      </n-flex>
    </div>
    <div>
      <b>{{ title }}</b>
    </div>
    <div class="parliament-visualization">
      <n-flex :size="0" :vertical="screenSize.isMobile" :reverse="screenSize.isMobile">
        <div class="parliament-area">
          <n-flex :size="0" vertical>
            <div class="seat-arrangement">The seat arrangement</div>
            <div class="x-axis-title">The x-axis legend</div>
          </n-flex>
        </div>
        <div class="legend-area">
          <n-flex :size:="0" vertical>
            <div class="legend-title">The legend title</div>
            <div class="seat-legend">The legend</div>
          </n-flex>
        </div>
      </n-flex>
    </div>
    <div class="parliament-selection">
      <n-flex :size="0" :vertical="screenSize.isMobile">
        <div class="seat-arrangement-selection">Seat arrangement selection</div>
        <div class="seat-feature-selection">Seat feature selection</div>
      </n-flex>
    </div>
    <div>Member focus</div>
    <div>Abstimmungsresultate, etc.</div>
  </n-flex>
</template>

<style scoped>
.parliament-area {
  flex: 4;
}

.legend-area {
  flex: 1;
}

.seat-arrangement-selection {
  flex: 1;
}

.seat-feature-selection {
  flex: 1;
}
</style>
